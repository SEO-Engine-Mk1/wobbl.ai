/**
 * Cloudinary Integration Configuration
 * Handles Cloudinary image and video upload, transformation, and management
 */

import { createHash } from 'crypto';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure?: boolean;
  folder?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  format?: string;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low' | number;
  crop?: string;
  width?: number;
  height?: number;
  gravity?: string;
  eager?: Array<{
    transformation: string;
    format?: string;
  }>;
  tags?: string[];
  context?: Record<string, string>;
  metadata?: Record<string, any>;
  backup?: boolean;
  useFilename?: boolean;
  uniqueFilename?: boolean;
  filenameOverride?: string;
  invalidate?: boolean;
  discardOriginalFilename?: boolean;
}

export interface CloudinaryResource {
  publicId: string;
  format: string;
  version: number;
  resourceType: string;
  type: string;
  createdAt: string;
  bytes: number;
  width?: number;
  height?: number;
  url: string;
  secureUrl: string;
  tags: string[];
  context?: Record<string, string>;
  metadata?: Record<string, any>;
  eager?: Array<{
    transformation: string;
    url: string;
    secureUrl: string;
  }>;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'limit' | 'pad' | 'lpad' | 'mpad' | 'crop' | 'thumb';
  gravity?: string;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low' | number;
  format?: string;
  fetchFormat?: string;
  effect?: string;
  overlay?: string;
  underlay?: string;
  angle?: number;
  opacity?: number;
  border?: string;
  radius?: number;
  background?: string;
  color?: string;
  contrast?: number;
  brightness?: number;
  saturation?: number;
  gamma?: number;
  sharpen?: number;
  blur?: number;
  grayscale?: boolean;
  sepia?: boolean;
  dpr?: number;
  zoom?: number;
  x?: number;
  y?: number;
  flags?: string[];
}

class CloudinaryIntegration {
  private config: CloudinaryConfig;
  private baseUrl: string;

  constructor(config: CloudinaryConfig) {
    this.config = config;
    this.baseUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}`;
  }

  private generateSignature(params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return createHash('sha1')
      .update(sortedParams + this.config.apiSecret)
      .digest('hex');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Cloudinary API error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Upload operations
  async upload(
    file: File | Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryResource> {
    const formData = new FormData();
    
    // Add file
    if (typeof file === 'string') {
      formData.append('file', file);
    } else if (file instanceof File) {
      formData.append('file', file);
    } else {
      const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
      const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/octet-stream' });
      formData.append('file', blob);
    }

    // Add options
    const uploadOptions: Record<string, string> = {
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    if (options.folder || this.config.folder) {
      uploadOptions.folder = options.folder || this.config.folder!;
    }

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.overwrite !== undefined) {
      uploadOptions.overwrite = options.overwrite.toString();
    }

    if (options.resourceType) {
      uploadOptions.resource_type = options.resourceType;
    }

    if (options.format) {
      uploadOptions.format = options.format;
    }

    if (options.quality) {
      uploadOptions.quality = options.quality.toString();
    }

    if (options.crop) {
      uploadOptions.crop = options.crop;
    }

    if (options.width) {
      uploadOptions.width = options.width.toString();
    }

    if (options.height) {
      uploadOptions.height = options.height.toString();
    }

    if (options.gravity) {
      uploadOptions.gravity = options.gravity;
    }

    if (options.eager && options.eager.length > 0) {
      uploadOptions.eager = options.eager.map(e => e.transformation).join('|');
    }

    if (options.tags && options.tags.length > 0) {
      uploadOptions.tags = options.tags.join(',');
    }

    if (options.context) {
      uploadOptions.context = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
    }

    if (options.metadata) {
      uploadOptions.metadata = JSON.stringify(options.metadata);
    }

    if (options.backup !== undefined) {
      uploadOptions.backup = options.backup.toString();
    }

    if (options.useFilename !== undefined) {
      uploadOptions.use_filename = options.useFilename.toString();
    }

    if (options.uniqueFilename !== undefined) {
      uploadOptions.unique_filename = options.uniqueFilename.toString();
    }

    if (options.filenameOverride) {
      uploadOptions.filename_override = options.filenameOverride;
    }

    if (options.invalidate !== undefined) {
      uploadOptions.invalidate = options.invalidate.toString();
    }

    if (options.discardOriginalFilename !== undefined) {
      uploadOptions.discard_original_filename = options.discardOriginalFilename.toString();
    }

    // Generate signature
    const signature = this.generateSignature(uploadOptions);
    uploadOptions.signature = signature;
    uploadOptions.api_key = this.config.apiKey;

    // Add to form data
    Object.entries(uploadOptions).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const resourceType = options.resourceType || 'image';
    return this.makeRequest<CloudinaryResource>(`/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });
  }

  async uploadFromUrl(
    url: string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryResource> {
    return this.upload(url, options);
  }

  // Resource management
  async getResource(
    publicId: string,
    resourceType: string = 'image'
  ): Promise<CloudinaryResource> {
    return this.makeRequest<CloudinaryResource>(
      `/resources/${resourceType}/upload/${publicId}`
    );
  }

  async listResources(options: {
    resourceType?: string;
    type?: string;
    prefix?: string;
    tags?: boolean;
    context?: boolean;
    maxResults?: number;
    nextCursor?: string;
    direction?: 'asc' | 'desc';
  } = {}): Promise<{
    resources: CloudinaryResource[];
    nextCursor?: string;
    rateLimitAllowed?: number;
    rateLimitResetAt?: string;
  }> {
    const params = new URLSearchParams();
    
    if (options.type) params.append('type', options.type);
    if (options.prefix) params.append('prefix', options.prefix);
    if (options.tags !== undefined) params.append('tags', options.tags.toString());
    if (options.context !== undefined) params.append('context', options.context.toString());
    if (options.maxResults) params.append('max_results', options.maxResults.toString());
    if (options.nextCursor) params.append('next_cursor', options.nextCursor);
    if (options.direction) params.append('direction', options.direction);

    const resourceType = options.resourceType || 'image';
    const endpoint = `/resources/${resourceType}/upload${params.toString() ? `?${params.toString()}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async deleteResource(
    publicId: string,
    resourceType: string = 'image',
    invalidate?: boolean
  ): Promise<{ result: string }> {
    const params = new URLSearchParams();
    if (invalidate) params.append('invalidate', 'true');
    
    return this.makeRequest(`/resources/${resourceType}/upload/${publicId}${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'DELETE',
    });
  }

  async deleteResources(
    publicIds: string[],
    resourceType: string = 'image',
    invalidate?: boolean
  ): Promise<{ deleted: CloudinaryResource[]; partial: boolean }> {
    const params = new URLSearchParams();
    if (invalidate) params.append('invalidate', 'true');
    
    return this.makeRequest(`/resources/${resourceType}/upload${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_ids: publicIds }),
    });
  }

  async renameResource(
    publicId: string,
    newPublicId: string,
    resourceType: string = 'image',
    overwrite?: boolean
  ): Promise<CloudinaryResource> {
    const params = new URLSearchParams();
    if (overwrite) params.append('overwrite', 'true');
    
    return this.makeRequest(`/resources/${resourceType}/upload/${publicId}/rename${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_public_id: newPublicId }),
    });
  }

  // URL generation
  buildUrl(publicId: string, options: CloudinaryTransformation = {}): string {
    const transformations = this.buildTransformationString(options);
    const baseUrl = this.config.secure !== false ? 'https' : 'http';
    const subdomain = this.config.secure !== false ? 'res' : 'res.cloudinary.com';
    
    return `${baseUrl}://${subdomain}/${this.config.cloudName}/image${transformations ? '/upload' : ''}${transformations}/${publicId}`;
  }

  buildVideoUrl(publicId: string, options: CloudinaryTransformation = {}): string {
    const transformations = this.buildTransformationString(options);
    const baseUrl = this.config.secure !== false ? 'https' : 'http';
    const subdomain = this.config.secure !== false ? 'res' : 'res.cloudinary.com';
    
    return `${baseUrl}://${subdomain}/${this.config.cloudName}/video${transformations ? '/upload' : ''}${transformations}/${publicId}`;
  }

  private buildTransformationString(options: CloudinaryTransformation): string {
    const transformations: string[] = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.fetchFormat) transformations.push(`f_${options.fetchFormat}`);
    if (options.effect) transformations.push(`e_${options.effect}`);
    if (options.overlay) transformations.push(`l_${options.overlay}`);
    if (options.underlay) transformations.push(`u_${options.underlay}`);
    if (options.angle) transformations.push(`a_${options.angle}`);
    if (options.opacity) transformations.push(`o_${options.opacity}`);
    if (options.border) transformations.push(`bo_${options.border}`);
    if (options.radius) transformations.push(`r_${options.radius}`);
    if (options.background) transformations.push(`b_${options.background}`);
    if (options.color) transformations.push(`co_${options.color}`);
    if (options.contrast) transformations.push(`e_contrast:${options.contrast}`);
    if (options.brightness) transformations.push(`e_brightness:${options.brightness}`);
    if (options.saturation) transformations.push(`e_saturation:${options.saturation}`);
    if (options.gamma) transformations.push(`e_gamma:${options.gamma}`);
    if (options.sharpen) transformations.push(`e_sharpen:${options.sharpen}`);
    if (options.blur) transformations.push(`e_blur:${options.blur}`);
    if (options.grayscale) transformations.push('e_grayscale');
    if (options.sepia) transformations.push('e_sepia');
    if (options.dpr) transformations.push(`dpr_${options.dpr}`);
    if (options.zoom) transformations.push(`z_${options.zoom}`);
    if (options.x) transformations.push(`x_${options.x}`);
    if (options.y) transformations.push(`y_${options.y}`);
    if (options.flags && options.flags.length > 0) {
      transformations.push(`fl_${options.flags.join(':')}`);
    }

    return transformations.length > 0 ? `/${transformations.join(',')}` : '';
  }

  // Utility methods
  async getUsageStats(): Promise<{
    plan: string;
    lastUpdated: string;
    transformations: number;
    objects: number;
    bandwidth: number;
    storage: number;
    requests: number;
    derivedResources: number;
  }> {
    return this.makeRequest('/usage');
  }

  async createFolder(path: string): Promise<{ success: boolean }> {
    return this.makeRequest('/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  }

  async deleteFolder(path: string): Promise<{ deleted: string[]; partial: boolean }> {
    return this.makeRequest(`/folders/${path}`, {
      method: 'DELETE',
    });
  }

  async addTag(tag: string, publicIds: string[]): Promise<{ publicIds: string[] }> {
    return this.makeRequest('/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag,
        public_ids: publicIds,
      }),
    });
  }

  async removeTag(tag: string, publicIds: string[]): Promise<{ publicIds: string[] }> {
    return this.makeRequest('/tags/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag,
        public_ids: publicIds,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.getUsageStats();
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

export default CloudinaryIntegration;

// Utility functions
export function createCloudinaryClient(config: CloudinaryConfig): CloudinaryIntegration {
  return new CloudinaryIntegration(config);
}

export function validateCloudinaryConfig(config: CloudinaryConfig): boolean {
  return !!(config.cloudName && config.apiKey && config.apiSecret);
}

export function getCloudinaryConfigFromEnv(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    secure: true,
    folder,
  };
}

// Common transformation presets
export const TRANSFORMATION_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'thumb' as const, gravity: 'face' },
  avatar: { width: 100, height: 100, crop: 'fill' as const, gravity: 'face' },
  banner: { width: 1200, height: 400, crop: 'fill' as const, gravity: 'auto' },
  card: { width: 300, height: 200, crop: 'fill' as const, gravity: 'auto' },
  responsive: { width: 'auto', dpr: 'auto', crop: 'scale' as const, quality: 'auto' as const },
  optimized: { quality: 'auto' as const, fetchFormat: 'auto' },
  grayscale: { effect: 'grayscale' },
  sepia: { effect: 'sepia' },
  blur: { effect: 'blur:500' },
  sharpen: { effect: 'sharpen' },
  brightness: { effect: 'brightness:20' },
  contrast: { effect: 'contrast:20' },
  saturation: { effect: 'saturation:20' },
} as const;