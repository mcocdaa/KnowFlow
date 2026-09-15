import { Image, Modal } from 'antd';

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
  mediaType: 'image' | 'video';
}

const MediaPreviewModal = ({ open, onClose, src, mediaType }: MediaPreviewModalProps) => (
  <Modal open={open} onCancel={onClose} footer={null} width={800} destroyOnHidden title="预览">
    {mediaType === 'image' ? (
      <Image src={src} alt="预览" style={{ width: '100%' }} />
    ) : (
      <video src={src} controls style={{ width: '100%' }} />
    )}
  </Modal>
);

export default MediaPreviewModal;
