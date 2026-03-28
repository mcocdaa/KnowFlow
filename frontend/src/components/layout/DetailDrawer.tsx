import React from 'react';
import { Button, Popconfirm, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, PictureOutlined, VideoCameraOutlined, CloseOutlined, FolderOpenOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { COLORS, SHADOWS, TRANSITIONS, BORDER_RADIUS } from '../../theme';
import type { KnowledgeItem, KeyDefinition, CategoryDefinition } from '../../types';
import { PluginRenderer, hasPluginComponent } from '../../plugins';

const DrawerContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 40px 0;
  background: transparent;
`;

const GlassCard = styled.div`
  width: 400px;
  height: auto;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px 0 0 24px;
  box-shadow: 0px 0 16px rgba(99, 102, 241, 0.92), -4px 0 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-right: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  animation: slideInRight 0.3s ease;

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const HeaderSection = styled.div`
  padding: 20px 24px;
  background: ${COLORS.gradientPrimary};
  color: white;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);

  .anticon {
    font-size: 22px;
    color: white;
  }
`;

const TitleArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  word-break: break-all;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.4;
`;

const CloseButton = styled(Button)`
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: none !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all ${TRANSITIONS.normal} !important;

  &:hover {
    background: rgba(255, 255, 255, 0.25) !important;
    transform: scale(1.05);
  }

  .anticon {
    font-size: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  flex-shrink: 0;
`;

const ActionButton = styled(Button)<{ $variant?: 'primary' | 'edit' | 'danger' | 'success' }>`
  height: 42px !important;
  border-radius: 10px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  transition: all ${TRANSITIONS.normal} !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px;

  ${props => props.$variant === 'primary' && `
    background: ${COLORS.gradientPrimary} !important;
    border: none !important;
    color: white !important;
    box-shadow: ${SHADOWS.button} !important;

    &:hover {
      box-shadow: ${SHADOWS.buttonHover} !important;
      transform: translateY(-2px);
    }
  `}

  ${props => props.$variant === 'edit' && `
    background: white !important;
    border: 2px solid ${COLORS.primary} !important;
    color: ${COLORS.primary} !important;

    &:hover {
      background: ${COLORS.primaryLight} !important;
      transform: translateY(-2px);
    }
  `}

  ${props => props.$variant === 'danger' && `
    background: white !important;
    border: 2px solid ${COLORS.danger} !important;
    color: ${COLORS.danger} !important;

    &:hover {
      background: ${COLORS.dangerLight} !important;
      transform: translateY(-2px);
    }
  `}

  ${props => props.$variant === 'success' && `
    background: white !important;
    border: 2px solid ${COLORS.success} !important;
    color: ${COLORS.success} !important;

    &:hover {
      background: ${COLORS.successLight} !important;
      transform: translateY(-2px);
    }
  `}

  .anticon {
    font-size: 15px;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 2px;
  }
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(99, 102, 241, 0.08);
  transition: all ${TRANSITIONS.normal};

  &:hover {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08);
  }
`;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${COLORS.text};
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid;
  border-image: ${COLORS.gradientPrimary} 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PropertyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: ${COLORS.backgroundAlt};
  border-radius: 10px;
  border: 1px solid ${COLORS.borderLight};
  transition: all ${TRANSITIONS.normal};

  &:hover {
    background: ${COLORS.primaryLighter};
    border-color: ${COLORS.primaryLight};
    transform: translateX(4px);
  }
`;

const PropertyLabel = styled.span`
  font-weight: 600;
  color: ${COLORS.textSecondary};
  font-size: 11px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const PropertyValue = styled.div`
  color: ${COLORS.text};
  word-break: break-all;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
  padding: 8px 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid ${COLORS.borderLight};
`;

const BooleanValue = styled.span<{ $value: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: ${props => props.$value ? COLORS.successLight : COLORS.dangerLight};
  color: ${props => props.$value ? COLORS.success : COLORS.danger};
`;

const NumberValue = styled.span`
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  font-weight: 600;
  color: ${COLORS.primary};
  background: ${COLORS.primaryLighter};
  padding: 6px 12px;
  border-radius: 6px;
`;

const CodeValue = styled.pre`
  margin: 0;
  padding: 12px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
`;

interface DetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedItem: KnowledgeItem | null;
  onOpenFileLocation: (path: string) => void;
  onEditItem: (item: KnowledgeItem) => void;
  onDeleteItem: (id: string) => void;
  onMediaPreview: (url: string, type: string) => void;
  getFileIcon: (fileType?: string) => React.ReactNode;
  formatDate?: (dateString: string) => string;
  definitionList: KeyDefinition[];
  categories: CategoryDefinition[];
}

const formatValueByType = (value: any, valueType: string): React.ReactNode => {
  if (value === undefined || value === null || value === '') return <span style={{ color: COLORS.textLight }}>-</span>;

  switch (valueType) {
    case 'boolean':
      return <BooleanValue $value={value}>{value ? '✓ 是' : '✗ 否'}</BooleanValue>;
    case 'number':
      return <NumberValue>{String(value)}</NumberValue>;
    case 'array':
    case 'object':
      try {
        const jsonStr = JSON.stringify(value, null, 2);
        return <CodeValue>{jsonStr}</CodeValue>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'string':
    default:
      const strValue = String(value);
      if (strValue.length > 200) {
        return <span>{strValue.substring(0, 200)}...</span>;
      }
      return strValue;
  }
};

const getCategoryIcon = (categoryName: string): string => {
  if (categoryName.includes('basic') || categoryName.includes('基础')) return '📋';
  if (categoryName.includes('time') || categoryName.includes('时间')) return '⏰';
  if (categoryName.includes('custom') || categoryName.includes('自定义')) return '⚙️';
  if (categoryName.includes('inner') || categoryName.includes('内置')) return '🔧';
  return '📁';
};

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  visible,
  onClose,
  selectedItem,
  onOpenFileLocation,
  onEditItem,
  onDeleteItem,
  onMediaPreview,
  getFileIcon,
  definitionList,
  categories,
}) => {
  if (!selectedItem) return null;

  const displayPath = (selectedItem.keyValues?.['file_path'] as string) || '';
  const displayType = (selectedItem.keyValues?.['file_type'] as string) || '';
  const isMedia = displayType.includes('image') || displayType.includes('video');

  const visibleKeys = definitionList.filter(def => def.is_visible);

  const keysByCategory = React.useMemo(() => {
    const map = new Map<string, KeyDefinition[]>();

    visibleKeys.forEach(def => {
      const value = selectedItem.keyValues?.[def.name];
      if (value !== undefined && value !== null && value !== '') {
        const catName = def.category_name || 'other';
        if (!map.has(catName)) {
          map.set(catName, []);
        }
        map.get(catName)!.push(def);
      }
    });

    return map;
  }, [visibleKeys, selectedItem.keyValues]);

  const getCategoryTitle = (categoryName: string): string => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.title || categoryName;
  };

  return (
    <>
      <style>
        {`
          .glass-drawer .ant-drawer-content-wrapper {
            background: transparent !important;
            box-shadow: none !important;
          }
          .glass-drawer .ant-drawer-content {
            background: transparent !important;
            box-shadow: none !important;
          }
          .glass-drawer .ant-drawer-body {
            background: transparent !important;
            padding: 0 !important;
          }
          .glass-drawer .ant-drawer-wrapper-body {
            background: transparent !important;
          }
          .glass-drawer .ant-drawer-section {
            background: transparent !important;
          }
        `}
      </style>
      <Drawer
        title={null}
        placement="right"
        onClose={onClose}
        open={visible}
        styles={{
          body: {
            padding: 0,
            background: 'transparent',
          },
          header: { display: 'none' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
          wrapper: { width: '420px' },
        }}
        style={{
          pointerEvents: 'none',
        }}
        rootClassName="glass-drawer"
      >
        <DrawerContent>
          <GlassCard>
            <HeaderSection>
              <HeaderContent>
                <IconContainer>
                  {getFileIcon(displayType as string)}
                </IconContainer>
                <TitleArea>
                  <Title>{selectedItem.name || displayPath || '未命名'}</Title>
                </TitleArea>
                <CloseButton
                  type="text"
                  onClick={onClose}
                  icon={<CloseOutlined />}
                />
              </HeaderContent>
            </HeaderSection>

            <ButtonGroup>
              {displayPath && (
                <ActionButton
                  $variant="primary"
                  icon={<FolderOpenOutlined />}
                  onClick={() => onOpenFileLocation(displayPath)}
                >
                  打开所在文件夹
                </ActionButton>
              )}
              <ActionButton
                $variant="edit"
                icon={<EditOutlined />}
                onClick={() => onEditItem(selectedItem)}
              >
                编辑参数
              </ActionButton>
              <Popconfirm
                title="确定要删除这个文件吗？"
                description="此操作不可恢复"
                onConfirm={() => onDeleteItem(selectedItem.id)}
                okText="确定"
                cancelText="取消"
              >
                <ActionButton
                  $variant="danger"
                  icon={<DeleteOutlined />}
                >
                  删除文件
                </ActionButton>
              </Popconfirm>
              {isMedia && displayPath && (
                <ActionButton
                  $variant="success"
                  icon={displayType.includes('image') ? <PictureOutlined /> : <VideoCameraOutlined />}
                  onClick={() => onMediaPreview(displayPath, displayType)}
                >
                  预览文件
                </ActionButton>
              )}
            </ButtonGroup>

            <ContentSection>
              {Array.from(keysByCategory.entries()).map(([categoryName, keys]) => (
                <InfoCard key={categoryName}>
                  <CardTitle>
                    <span>{getCategoryIcon(categoryName)}</span>
                    {getCategoryTitle(categoryName)}
                  </CardTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {keys.map(def => {
                      const value = selectedItem.keyValues?.[def.name];
                      const hasPlugin = def.plugin_name && hasPluginComponent(def.plugin_name);

                      return (
                        <PropertyItem key={def.name}>
                          <PropertyLabel>{def.title}</PropertyLabel>
                          <PropertyValue>
                            {hasPlugin ? (
                              <PluginRenderer
                                pluginName={def.plugin_name}
                                value={value}
                                itemId={selectedItem.id}
                                keyDefinition={{
                                  name: def.name,
                                  title: def.title,
                                  value_type: def.value_type,
                                }}
                                onUpdate={() => {}}
                                readOnly={true}
                              />
                            ) : (
                              formatValueByType(value, def.value_type)
                            )}
                          </PropertyValue>
                        </PropertyItem>
                      );
                    })}
                  </div>
                </InfoCard>
              ))}

              {keysByCategory.size === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  color: COLORS.textSecondary,
                  background: COLORS.backgroundAlt,
                  borderRadius: BORDER_RADIUS.lg,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 14 }}>暂无属性信息</div>
                </div>
              )}
            </ContentSection>
          </GlassCard>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DetailDrawer;
