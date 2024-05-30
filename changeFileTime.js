/**
 * 从iCloud+ 导出的视频，文件日期全部混乱，但是部分被隐藏起来了。
 * 可以通过以下node 代码，从文件中“创建媒体日期” 提取当时的拍摄日期，设置成文件的修改日期和创建日期；
 * 
 * 图片文件，可以使用https://github.com/Cryolitia/PhotoTimeFix
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffprobe-static').path;
const ffmpeg = require('fluent-ffmpeg');

// 指定照片所在的目录路径
const photoDirectory = 'D:/Personal/Photo/iCloud 照片/no_time';
const defaultTime = `1998-08-15T00:00:00Z`;

// 递归遍历目录下的所有文件
function traverseDirectory(directoryPath) {
  const fileNames = fs.readdirSync(directoryPath);

  fileNames.forEach((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    const fileExtension = path.extname(filePath).toLowerCase();
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 如果是目录，则递归遍历
      traverseDirectory(filePath);
    } else {
      if (fileExtension === '.mp4' || fileExtension == '.mov' || fileExtension == '.avi') {
        // 设置 ffprobe 路径
        ffmpeg.setFfprobePath(ffmpegPath);

        // 使用 fluent-ffmpeg 获取视频元数据信息
        ffmpeg.ffprobe(filePath, function(err, metadata) {
          if (err) {
            console.error('Error reading metadata:', err.message);
            return;
          }

          // 提取创建媒体日期（creation_time）字段值
          const mediaCreateDate = metadata.format.tags.creation_time;

          // 如果不存在，则设置默认事件
          if(!mediaCreateDate) {
            console.log(`${fileName}不存在 创建媒体日期`)
            
            changeFileTime(filePath, defaultTime)
            return 
          }

          // 修改创建时间、修改时间
          changeFileTime(filePath, mediaCreateDate)
          // console.log('Create Date:', mediaCreateDate);
        });
        // console.log(`Modified creation time for ${filePath}`);
      } else {
        changeFileTime(filePath, defaultTime)
      }
    }
  });
}

traverseDirectory(photoDirectory);

function changeFileTime(filePath, dateTime) {
  // 调用windows 命令
  const command = `powershell -Command "$file = Get-Item '${filePath}'; $file.CreationTime = '${dateTime}'; $file.LastWriteTime = '${dateTime}'"`

  execSync(command);
}