import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

export interface SyncStatus {
  ahead: number;
  behind: number;
  hasChanges: boolean;
}

export class GitSyncService {
  constructor(
    private readonly gitDir: string,
    private readonly getConfig: () => Promise<{ token: string; repoUrl: string; configured: boolean }>
  ) { }

  async push(): Promise<void> {
    const config = await this.getConfig();

    if (!config.configured) {
      throw new Error('GitHub repository not configured');
    }

    try {
      // Vérifier s'il y a au moins un commit
      const branches = await git.listBranches({ fs, dir: this.gitDir });

      if (branches.length === 0) {
        throw new Error('No commits yet. Create a page first, then sync.');
      }

      // Vérifier si le remote existe
      const remotes = await git.listRemotes({ fs, dir: this.gitDir });

      if (remotes.length === 0) {
        // Ajouter le remote s'il n'existe pas
        await git.addRemote({
          fs,
          dir: this.gitDir,
          remote: 'origin',
          url: config.repoUrl,
        });
      }

      // Vérifier quelle est la branche courante
      const currentBranch = await git.currentBranch({ fs, dir: this.gitDir }) || 'main';

      await git.push({
        fs,
        http,
        dir: this.gitDir,
        remote: 'origin',
        ref: currentBranch,
        onAuth: () => ({ username: config.token }),
        force: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Si c'est notre message personnalisé, le relancer tel quel
      if (errorMessage.includes('No commits yet')) {
        throw error;
      }

      // Si c'est un problème de branche qui n'existe pas encore sur le remote, on force le push
      if (errorMessage.includes('could not find') || errorMessage.includes('not found')) {
        try {
          const currentBranch = await git.currentBranch({ fs, dir: this.gitDir }) || 'main';

          await git.push({
            fs,
            http,
            dir: this.gitDir,
            remote: 'origin',
            ref: currentBranch,
            onAuth: () => ({ username: config.token }),
            force: true,
          });
          return;
        } catch (retryError) {
          throw new Error('Failed to push: ' + (retryError instanceof Error ? retryError.message : retryError));
        }
      }

      throw new Error('Failed to push: ' + errorMessage);
    }
  }

  async pull(): Promise<void> {
    const config = await this.getConfig();

    if (!config.configured) {
      throw new Error('GitHub repository not configured');
    }

    try {
      // Vérifier si le remote existe
      const remotes = await git.listRemotes({ fs, dir: this.gitDir });

      if (remotes.length === 0) {
        // Ajouter le remote s'il n'existe pas
        await git.addRemote({
          fs,
          dir: this.gitDir,
          remote: 'origin',
          url: config.repoUrl,
        });
      }

      await git.pull({
        fs,
        http,
        dir: this.gitDir,
        ref: 'main',
        author: {
          name: 'Colla System',
          email: 'system@colla.dev',
        },
        onAuth: () => ({ username: config.token }),
      });
    } catch (error) {
      // Si le pull échoue (ex: pas de remote branch), ignorer l'erreur
      console.log('Pull skipped:', error instanceof Error ? error.message : error);
    }
  }

  async sync(): Promise<void> {
    // Pull d'abord pour récupérer les changements distants
    await this.pull();

    // Puis push les changements locaux
    await this.push();
  }

  async getStatus(): Promise<SyncStatus> {
    const config = await this.getConfig();

    if (!config.configured) {
      return { ahead: 0, behind: 0, hasChanges: false };
    }

    try {
      // Vérifier s'il y a des changements non commités
      const statusMatrix = await git.statusMatrix({
        fs,
        dir: this.gitDir,
      });

      const hasChanges = statusMatrix.some(
        ([_filepath, headStatus, workdirStatus, stageStatus]) =>
          headStatus !== workdirStatus || workdirStatus !== stageStatus
      );

      // Récupérer les infos de sync avec le remote
      let ahead = 0;
      let behind = 0;

      try {
        const branches = await git.listBranches({ fs, dir: this.gitDir });

        if (branches.includes('main')) {
          const localCommit = await git.resolveRef({ fs, dir: this.gitDir, ref: 'main' });

          // Fetch pour avoir les dernières infos du remote
          await git.fetch({
            fs,
            http,
            dir: this.gitDir,
            remote: 'origin',
            ref: 'main',
            onAuth: () => ({ username: config.token }),
            depth: 1,
          });

          const remoteCommit = await git.resolveRef({
            fs,
            dir: this.gitDir,
            ref: 'refs/remotes/origin/main'
          });

          if (localCommit !== remoteCommit) {
            // Calculer le nombre de commits d'avance/retard
            const commits = await git.log({ fs, dir: this.gitDir, ref: 'main' });
            ahead = commits.length;
          }
        }
      } catch (error) {
        console.log('Could not check remote status:', error);
      }

      return { ahead, behind, hasChanges };
    } catch (error) {
      console.error('Failed to get git status:', error);
      return { ahead: 0, behind: 0, hasChanges: false };
    }
  }

  async hasUnpushedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return status.hasChanges || status.ahead > 0;
  }
}
