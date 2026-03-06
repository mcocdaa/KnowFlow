const fs = require('fs');
const path = require('path');

class BackupManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  // 导出数据
  async exportData(outputPath) {
    try {
      // 读取数据库文件
      if (!fs.existsSync(this.dbPath)) {
        throw new Error('Database file not found');
      }

      // 创建输出目录（如果不存在）
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 复制数据库文件到输出路径
      fs.copyFileSync(this.dbPath, outputPath);

      // 导出配置文件
      const configPath = path.join(path.dirname(this.dbPath), 'config.json');
      if (fs.existsSync(configPath)) {
        const configOutputPath = path.join(path.dirname(outputPath), 'config.json');
        fs.copyFileSync(configPath, configOutputPath);
      }

      return {
        success: true,
        message: 'Data exported successfully',
        path: outputPath
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 导入数据
  async importData(inputPath) {
    try {
      // 检查输入文件是否存在
      if (!fs.existsSync(inputPath)) {
        throw new Error('Input file not found');
      }

      // 备份当前数据库
      const backupPath = `${this.dbPath}.backup`;
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, backupPath);
      }

      // 复制输入文件到数据库路径
      fs.copyFileSync(inputPath, this.dbPath);

      // 导入配置文件
      const configInputPath = path.join(path.dirname(inputPath), 'config.json');
      if (fs.existsSync(configInputPath)) {
        const configPath = path.join(path.dirname(this.dbPath), 'config.json');
        fs.copyFileSync(configInputPath, configPath);
      }

      return {
        success: true,
        message: 'Data imported successfully',
        backupPath
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 自动备份
  async autoBackup(backupDir, maxBackups = 5) {
    try {
      // 创建备份目录（如果不存在）
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

      // 执行备份
      const result = await this.exportData(backupPath);

      if (result.success) {
        // 清理旧备份
        await this.cleanupOldBackups(backupDir, maxBackups);
      }

      return result;
    } catch (error) {
      console.error('Auto backup error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 清理旧备份
  async cleanupOldBackups(backupDir, maxBackups) {
    try {
      // 获取所有备份文件
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          mtime: fs.statSync(path.join(backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排序

      // 删除超出限制的旧备份
      if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`Deleted old backup: ${file.name}`);
        });
      }
    } catch (error) {
      console.error('Cleanup old backups error:', error);
    }
  }
}

module.exports = BackupManager;