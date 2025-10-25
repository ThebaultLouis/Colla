import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs/promises';
import path from 'path';

export interface GitConfig {
  token: string;
  repoUrl: string;
  localPath: string;
  configured: boolean;
}

export class SetupService {
  private configPath: string;
  private defaultLocalPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), '.colla-data', 'config.json');
    this.defaultLocalPath = path.join(process.cwd(), '.colla-data', 'git-repo');
  }

  async isConfigured(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config.configured;
    } catch {
      return false;
    }
  }

  async getConfig(): Promise<GitConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        token: '',
        repoUrl: '',
        localPath: this.defaultLocalPath,
        configured: false,
      };
    }
  }

  async setupGitHub(token: string, repoUrl: string): Promise<void> {
    // Valider le format de l'URL
    if (!repoUrl.startsWith('https://github.com/')) {
      throw new Error('Repository URL must be a GitHub HTTPS URL');
    }

    // Créer le dossier de config s'il n'existe pas
    const configDir = path.dirname(this.configPath);
    await fs.mkdir(configDir, { recursive: true });

    // Vérifier si le repository existe déjà localement
    const repoExists = await this.checkLocalRepo();

    if (!repoExists) {
      // Cloner le repository
      await this.cloneRepository(token, repoUrl);
    }

    // Sauvegarder la configuration
    const config: GitConfig = {
      token,
      repoUrl,
      localPath: this.defaultLocalPath,
      configured: true,
    };

    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  private async checkLocalRepo(): Promise<boolean> {
    try {
      await fs.access(path.join(this.defaultLocalPath, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  private async cloneRepository(token: string, repoUrl: string): Promise<void> {
    // Créer le dossier parent
    await fs.mkdir(this.defaultLocalPath, { recursive: true });

    try {
      await git.clone({
        fs: require('fs'),
        http,
        dir: this.defaultLocalPath,
        url: repoUrl,
        onAuth: () => ({ username: token }),
        singleBranch: true,
      });
    } catch (error) {
      // Si le repository n'existe pas, initialiser un nouveau repo
      if (error instanceof Error && error.message.includes('404')) {
        await this.initializeNewRepo(token, repoUrl);
      } else {
        throw error;
      }
    }
  }

  private async initializeNewRepo(token: string, repoUrl: string): Promise<void> {
    // Initialiser un nouveau repository Git local
    await git.init({
      fs: require('fs'),
      dir: this.defaultLocalPath,
      defaultBranch: 'main',
    });

    // Créer un fichier README initial
    const readmePath = path.join(this.defaultLocalPath, 'README.md');
    await fs.writeFile(readmePath, '# Colla Workspace\n\nThis repository contains your Colla pages and databases.\n');

    // Ajouter et committer le README
    await git.add({
      fs: require('fs'),
      dir: this.defaultLocalPath,
      filepath: 'README.md',
    });

    await git.commit({
      fs: require('fs'),
      dir: this.defaultLocalPath,
      message: 'Initial commit',
      author: {
        name: 'Colla',
        email: 'colla@example.com',
      },
    });

    // Ajouter le remote
    await git.addRemote({
      fs: require('fs'),
      dir: this.defaultLocalPath,
      remote: 'origin',
      url: repoUrl,
    });

    // Pousser vers GitHub
    await git.push({
      fs: require('fs'),
      http,
      dir: this.defaultLocalPath,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: token }),
    });
  }
}
