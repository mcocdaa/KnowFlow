import React from 'react';
import { Modal, Image } from 'antd';

interface MediaPreviewProps {
  visible: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ visible, onClose, mediaUrl, mediaType }) => {
  return (
    <Modal
      title="媒体预览"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {mediaType === 'image' ? (
        <Image src={mediaUrl} alt="预览图片" style={{ width: '100%' }} />
      ) : (
        <video
          src={mediaUrl}
          controls
          autoPlay
          style={{ width: '100%' }}
        />
      )}
    </Modal>
  );
};

export default MediaPreview;
