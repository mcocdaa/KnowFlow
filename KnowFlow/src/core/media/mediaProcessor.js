const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

class MediaProcessor {
  constructor() {
    this.supportedImageTypes = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];
    this.supportedVideoTypes = ['mp4', 'avi', 'mov', 'wmv', 'mkv'];
  }

  // 处理图片文件
  async processImage(filePath) {
    try {
      // 获取图片元数据
      const metadata = await sharp(filePath).metadata();
      
      // 生成缩略图
      const thumbnailPath = this.generateThumbnailPath(filePath);
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside' })
        .toFile(thumbnailPath);

      // 提取EXIF信息
      const exif = metadata.exif || {};

      // 构建key-value
      const keyValues = [
        { key: 'image_resolution', value: `${metadata.width}x${metadata.height}` },
        { key: 'image_format', value: metadata.format },
        { key: 'image_size', value: `${Math.round((metadata.size || 0) / 1024)}KB` }
      ];

      // 添加拍摄地点（如果有）
      if (exif.GPSLatitude && exif.GPSLongitude) {
        keyValues.push({ 
          key: 'location', 
          value: `${exif.GPSLatitude}, ${exif.GPSLongitude}` 
        });
      }

      return {
        success: true,
        keyValues,
        thumbnailPath
      };
    } catch (error) {
      console.error('Process image error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 处理视频文件
  async processVideo(filePath) {
    try {
      // 获取视频元数据
      const metadata = await this.getVideoMetadata(filePath);
      
      // 生成缩略图
      const thumbnailPath = this.generateThumbnailPath(filePath);
      await this.extractVideoThumbnail(filePath, thumbnailPath);

      // 构建key-value
      const keyValues = [
        { key: 'video_duration', value: metadata.duration },
        { key: 'video_resolution', value: `${metadata.width}x${metadata.height}` },
        { key: 'video_codec', value: metadata.codec },
        { key: 'video_size', value: `${Math.round((metadata.size || 0) / (1024 * 1024))}MB` }
      ];

      return {
        success: true,
        keyValues,
        thumbnailPath
      };
    } catch (error) {
      console.error('Process video error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取视频元数据
  getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const stream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: Math.round(metadata.format.duration),
          width: stream?.width || 0,
          height: stream?.height || 0,
          codec: stream?.codec_name || 'unknown',
          size: metadata.format.size
        });
      });
    });
  }

  // 提取视频缩略图
  extractVideoThumbnail(filePath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .screenshots({
          count: 1,
          folder: path.dirname(outputPath),
          filename: path.basename(outputPath),
          size: '200x200'
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  // 生成缩略图路径
  generateThumbnailPath(filePath) {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const ext = '.jpg';
    return path.join(dir, `.${baseName}_thumbnail${ext}`);
  }

  // 检查文件类型
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase().substring(1);
    if (this.supportedImageTypes.includes(ext)) {
      return 'image';
    } else if (this.supportedVideoTypes.includes(ext)) {
      return 'video';
    }
    return 'other';
  }

  // 批量处理媒体文件
  async batchProcess(files) {
    const results = [];
    for (const file of files) {
      const fileType = this.getFileType(file.path);
      let result;
      
      if (fileType === 'image') {
        result = await this.processImage(file.path);
      } else if (fileType === 'video') {
        result = await this.processVideo(file.path);
      } else {
        result = { success: false, error: 'Unsupported file type' };
      }
      
      results.push({ file: file.path, type: fileType, ...result });
    }
    return results;
  }
}

module.exports = MediaProcessor;