import React, { useState } from 'react';
import { Layout as AntLayout, Button, Space, message, Modal } from 'antd';
import DynamicKeyForm from './DynamicKeyForm';
import { SettingOutlined, BankOutlined, CopyOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setSearchResults } from '../store/knowledgeSlice';
import KeyManager from './KeyManager';
import AIAssistant from './AIAssistant';
import MediaPreview from './MediaPreview';
import {
  GlobalStyle,
  StyledLayout,
  StyledHeader,
  Logo,
  StyledSider,
  StyledMenu,
  StyledTabs,
  ResultsSection,
  PrimaryButton,
  SPACING,
  BORDER_RADIUS,
} from './LayoutParts/layout-styles';
import SearchSection from './LayoutParts/SearchSection';
import FileCard from './LayoutParts/FileCard';
import DetailDrawer from './LayoutParts/DetailDrawer';
import UploadSection from './LayoutParts/UploadSection';
import type { KnowledgeItem } from '../types';
import { useInitialData, useKnowledgeItems } from '../hooks/useKnowledge';
import { getFileIcon, formatDate, openFileLocation, buildCategoryTree } from '../utils/helpers';

const Layout: React.FC = () => {
  const dispatch = useDispatch();
  
  useInitialData();
  
  const {
    items,
    searchResults,
    selectedItem,
    selectedItemId,
    setSelectedItemId,
    handleItemClick,
    handleSearch,
    handleKeyClick,
    handleDeleteItem,
    handleUpdateItem,
    handleUploadFile,
    handleCreateItem,
    getSortedItems,
    getDefaultFormValues,
    definitionList,
    categories,
  } = useKnowledgeItems();
  
  const [keyManagerVisible, setKeyManagerVisible] = useState(false);
  const [aiAssistantVisible, setAIAssistantVisible] = useState(false);
  const [mediaPreviewVisible, setMediaPreviewVisible] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormValues, setEditFormValues] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState<string>('recommend');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fallbackToCopyMessage = (path: string) => {
    message.info({
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>文件路径: {path}</span>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(path);
              message.success('路径已复制到剪贴板');
            }}
          >
            复制
          </Button>
        </div>
      ),
      duration: 5,
    });
  };

  const handleOpenFileLocation = (filePath: string) => {
    openFileLocation(filePath, fallbackToCopyMessage);
  };

  const handleMediaPreview = (filePath: string, fileType: string) => {
    setMediaUrl(filePath);
    setMediaType(fileType.includes('image') ? 'image' : 'video');
    setMediaPreviewVisible(true);
  };

  const handleKeyClickWrapper = (keyName: string) => {
    handleKeyClick(keyName);
    setActiveTab('search');
  };

  const buildMenuItems = () => {
    const menuItems = [
      {
        key: 'key-management',
        label: (
          <span style={{ 
            color: '#1890ff', 
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <SettingOutlined />
            Key 管理
          </span>
        ),
        onClick: () => setKeyManagerVisible(true),
        style: {
          backgroundColor: '#e6f7ff',
          marginBottom: '8px',
          borderRadius: '6px',
          border: '1px solid #91d5ff',
        }
      },
    ];

    menuItems.push(...buildCategoryTree(categories, definitionList, handleKeyClickWrapper));
    return menuItems;
  };

  const handleEditItem = (item: KnowledgeItem) => {
    setEditingItem(item);
    const formValues: Record<string, any> = {};
    Object.entries(item.keyValues || {}).forEach(([keyName, value]) => {
      formValues[keyName] = value;
    });
    setEditFormValues(formValues);
    setEditFormVisible(true);
  };

  const handleEditSubmit = async (values: Record<string, any>) => {
    if (editingItem) {
      const updatedKeyValues: Record<string, any> = { ...editingItem.keyValues };
      definitionList.forEach(def => {
        const value = values[def.name];
        if (value !== undefined) {
          updatedKeyValues[def.name] = value;
        }
      });
      
      const updatedItem: KnowledgeItem = {
        ...editingItem,
        keyValues: updatedKeyValues,
        name: values['name'] || editingItem.name,
      };
      
      try {
        await handleUpdateItem(updatedItem);
        setEditFormVisible(false);
        setEditingItem(null);
        setEditFormValues({});
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setPendingFile(file);
    setEditFormVisible(true);
    setEditingItem(null);
    const defaultValues = getDefaultFormValues();
    defaultValues['name'] = file.name;
    defaultValues['file_path'] = file.name;
    defaultValues['file_type'] = file.type || '';
    setEditFormValues(defaultValues);
  };

  const handleShowAddForm = () => {
    setEditingItem(null);
    setEditFormValues(getDefaultFormValues());
    setEditFormVisible(true);
  };

  const renderFileList = (listItems: KnowledgeItem[]) => {
    return listItems
      .filter(item => !!item)
      .map(item => (
        <FileCard
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          onSelect={() => handleItemClick(item)}
          onDelete={handleDeleteItem}
          getFileIcon={getFileIcon}
        />
      ));
  };

  return (
    <>
      <GlobalStyle />
      <StyledLayout>
        <div className="gradient-decoration" />
        <div className="gradient-decoration-bottom" />
        <div className="gradient-decoration-center" />
        <StyledHeader>
          <Logo style={{ cursor: 'pointer' }} onClick={() => setActiveTab('recommend')}>
            <div className="logo-icon">K</div>
            <span>KnowFlow</span>
          </Logo>
          <Space>
            <PrimaryButton 
              icon={<BankOutlined />} 
              onClick={() => setAIAssistantVisible(true)}
            >
              AI助手
            </PrimaryButton>
          </Space>
        </StyledHeader>
        <AntLayout style={{ height: 'calc(100vh - 68px)', display: 'flex' }}>
          <StyledSider width={260}>
            <StyledMenu
              mode="inline"
              items={buildMenuItems()}
            />
          </StyledSider>
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', overflowY: 'auto' }}>
              <div className="main-card" style={{ maxWidth: '640px', width: '100%' }}>
                <StyledTabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={[
                    { key: 'recommend', label: '✨ 推荐' },
                    { key: 'all', label: '📁 全部' },
                    { key: 'search', label: '🔍 搜索' }
                  ]}
                />
                
                <SearchSection
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearch={(value) => {
                    handleSearch(value, sortBy);
                    setActiveTab('search');
                  }}
                  activeTab={activeTab}
                  sortBy={sortBy}
                  onSortByChange={(value) => {
                    setSortBy(value);
                    handleSearch(searchQuery, sortBy);
                  }}
                  searchKey={''}
                  onSearchKeyChange={() => {}}
                  categories={categories}
                  selectedCategory={''}
                  onCategoryChange={() => {}}
                  definitionList={definitionList}
                />
                
                <UploadSection
                  onFileUpload={handleFileUpload}
                  onShowAddForm={handleShowAddForm}
                />
                
                {activeTab === 'recommend' && (
                  <ResultsSection key="recommend">
                    <div className="section-title">
                      <span className="section-title-icon">✨</span>
                      推荐结果
                    </div>
                    {items.length > 0 ? (
                      renderFileList(getSortedItems(sortBy).slice(0, 5))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">暂无推荐</div>
                        <div className="empty-state-description">上传文件后将自动为您推荐相关内容</div>
                      </div>
                    )}
                  </ResultsSection>
                )}
                
                {activeTab === 'all' && (
                  <ResultsSection key="all">
                    <div className="section-title">
                      <span className="section-title-icon">📁</span>
                      全部文件
                    </div>
                    {items.length > 0 ? (
                      renderFileList(getSortedItems(sortBy))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">📂</div>
                        <div className="empty-state-title">暂无文件</div>
                        <div className="empty-state-description">上传您的第一个文件开始使用</div>
                      </div>
                    )}
                  </ResultsSection>
                )}
                
                {activeTab === 'search' && (
                  <ResultsSection key="search">
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: SPACING.md,
                    }}>
                      <div className="section-title" style={{ marginBottom: 0 }}>
                        <span className="section-title-icon">🔍</span>
                        搜索结果
                      </div>
                      <span className="status-badge info">
                        {searchResults.length} 个文件
                      </span>
                    </div>
                    {searchResults.length > 0 ? (
                      renderFileList(searchResults)
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-title">未找到结果</div>
                        <div className="empty-state-description">尝试其他分类或关键词进行搜索</div>
                      </div>
                    )}
                  </ResultsSection>
                )}
              </div>
            </div>
          </div>
        </AntLayout>
        
        <DetailDrawer
          visible={!!selectedItem && !!selectedItemId}
          onClose={() => {
            setSelectedItemId(null);
            dispatch(setSearchResults([]));
          }}
          selectedItem={selectedItem}
          onOpenFileLocation={handleOpenFileLocation}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onMediaPreview={handleMediaPreview}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
          definitionList={definitionList}
          categories={categories}
        />
        
        <KeyManager 
          visible={keyManagerVisible} 
          onClose={() => setKeyManagerVisible(false)} 
        />
        <AIAssistant 
          visible={aiAssistantVisible} 
          onClose={() => setAIAssistantVisible(false)} 
        />
        <MediaPreview 
          visible={mediaPreviewVisible} 
          onClose={() => setMediaPreviewVisible(false)} 
          mediaUrl={mediaUrl} 
          mediaType={mediaType} 
        />
        <Modal
          title={editingItem ? "编辑文件参数" : (pendingFile ? "上传文件" : "添加知识记录")}
          open={editFormVisible}
          onCancel={() => {
            setEditFormVisible(false);
            setPendingFile(null);
          }}
          footer={null}
          width={500}
          style={{
            borderRadius: BORDER_RADIUS.md,
          }}
        >
          <DynamicKeyForm 
            mode={editingItem ? "edit" : "add"} 
            initialValues={editFormValues} 
            itemId={editingItem?.id}
            onSubmit={editingItem ? handleEditSubmit : async (values) => {
              if (pendingFile) {
                try {
                  await handleUploadFile(pendingFile, values);
                  setEditFormVisible(false);
                  setEditFormValues({});
                  setPendingFile(null);
                } catch (error) {
                  // Error already handled in hook
                }
              } else {
                try {
                  await handleCreateItem(values);
                  setEditFormVisible(false);
                  setEditFormValues({});
                } catch (error) {
                  // Error already handled in hook
                }
              }
            }} 
          />
        </Modal>
      </StyledLayout>
    </>
  );
};

export default Layout;
