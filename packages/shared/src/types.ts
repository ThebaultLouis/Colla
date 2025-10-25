/**
 * DTOs (Data Transfer Objects) pour l'API
 * Ces types sont utilisés pour la communication entre le client et le serveur
 */

export interface PageDTO {
  id: string;
  title: string;
  content: string;
  properties: Record<string, PropertyDTO>;
  isDatabase: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDTO {
  name: string;
  type: string;
  value: any;
}

export interface DatabaseDTO {
  id: string;
  name: string;
  description: string;
  pageIds: string[];
  propertySchema: Record<string, string>; // propertyId -> propertyName
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  title: string;
  content?: string;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
  properties?: Record<string, PropertyDTO>;
}

export interface CreateDatabaseRequest {
  name: string;
  description?: string;
}

export interface UpdateDatabaseRequest {
  name?: string;
  description?: string;
}
