import { Image, Modal } from 'antd';
import { useI18n } from '../../i18n';

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
  mediaType: 'image' | 'video';
}

const MediaPreviewModal = ({ open, onClose, src, mediaType }: MediaPreviewModalProps) => {
  const { t } = useI18n();

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} destroyOnHidden title={t('预览', 'Preview')}>
      {mediaType === 'image' ? (
        <Image src={src} alt={t('预览', 'Preview')} style={{ width: '100%' }} />
      ) : (
        <video src={src} controls style={{ width: '100%' }} />
      )}
    </Modal>
  );
};

export default MediaPreviewModal;
