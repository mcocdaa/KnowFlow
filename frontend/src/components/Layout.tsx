import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Input, Select, Space, message, Modal, Form, Rate, Tabs, Card, Popconfirm, Tooltip } from 'antd';
import { SearchOutlined, UploadOutlined, SettingOutlined, BankOutlined, PictureOutlined, VideoCameraOutlined, EditOutlined, StarFilled, EyeFilled, CopyOutlined, FileOutlined, FileTextOutlined, FileImageOutlined, FilePdfOutlined, FireOutlined ,DeleteOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle, css } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addKnowledgeItem, setSearchResults, selectItem, incrementClickCount, updateKnowledgeItem, deleteKnowledgeItem, clearKnowledgeItems } from '../store/knowledgeSlice';
import { setCategories, setDefinitions } from '../store/keySlice';
import KeyManager from './KeyManager';
import AIAssistant from './AIAssistant';
import MediaPreview from './MediaPreview';
import { DynamicKeyForm } from './DynamicKeyForm';

const { Header, Sider, Content } = AntLayout;
const { Option } = Select;
const { Search } = Input;

// 全局样式变量
const COLORS = {
  primary: '#3B82F6', // 主色调：克莱因蓝
  primaryLight: 'rgba(59, 130, 246, 0.1)', // 主色调10%透明度
  background: '#F8FAFC', // 页面背景：极浅的暖灰白
  sidebarBg: '#F1F5F9', // 侧边栏背景：稍深的浅灰色
  text: '#1E293B', // 主文本色
  textSecondary: '#64748B', // 次要文本色
  border: '#E2E8F0', // 边框色
  white: '#FFFFFF', // 白色
  danger: '#EF4444', // 危险色
};

const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

const FONT_SIZES = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '24px',
};

const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// 全局样式
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${COLORS.background};
    color: ${COLORS.text};
  }
  
  * {
    box-sizing: border-box;
  }
`;

// 通用按钮样式
const buttonStyles = css`
  transition: all 0.2s ease;
  border-radius: ${BORDER_RADIUS.md};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const StyledLayout = styled(AntLayout)`
  height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: ${COLORS.white} !important;
  padding: 0 ${SPACING.lg} !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: 64px !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  z-index: 10 !important;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${FONT_SIZES.lg};
  font-weight: ${FONT_WEIGHTS.bold};
  color: ${COLORS.primary};
  
  .logo-icon {
    width: 28px;
    height: 28px;
    background: ${COLORS.primary};
    border-radius: ${BORDER_RADIUS.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.white};
    font-weight: ${FONT_WEIGHTS.bold};
    font-size: ${FONT_SIZES.sm};
  }
`;

const StyledSider = styled(Sider)`
  background: ${COLORS.sidebarBg} !important;
  overflow: auto !important;
  box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.1) !important;
`;

const StyledMenu = styled(Menu)`
  background: transparent !important;
  border-right: none !important;
  height: 100% !important;
  
  .ant-menu-item {
    margin: ${SPACING.xs} 0 !important;
    border-radius: ${BORDER_RADIUS.md} !important;
    margin-left: ${SPACING.sm} !important;
    margin-right: ${SPACING.sm} !important;
    height: 36px !important;
    line-height: 36px !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: ${COLORS.primaryLight} !important;
      color: ${COLORS.primary} !important;
    }
    
    &.ant-menu-item-selected {
      background: ${COLORS.primaryLight} !important;
      color: ${COLORS.primary} !important;
      font-weight: ${FONT_WEIGHTS.semibold} !important;
      border-left: 2px solid ${COLORS.primary} !important;
    }
  }
  
  .ant-menu-submenu-title {
    margin: ${SPACING.xs} 0 !important;
    border-radius: ${BORDER_RADIUS.md} !important;
    margin-left: ${SPACING.sm} !important;
    margin-right: ${SPACING.sm} !important;
    height: 36px !important;
    line-height: 36px !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: ${COLORS.primaryLight} !important;
      color: ${COLORS.primary} !important;
    }
  }
  
  .ant-menu-submenu {
    .ant-menu {
      background: transparent !important;
      
      .ant-menu-item {
        margin-left: ${SPACING.md} !important;
      }
    }
  }
`;

const StyledContent = styled(Content)`
  padding: ${SPACING.lg} !important;
  overflow: auto !important;
  background: ${COLORS.background} !important;
  min-height: calc(100vh - 64px) !important;
`;

const SearchSection = styled.div`
  margin-bottom: ${SPACING.lg};
`;

const ResultsSection = styled.div`
  margin-top: ${SPACING.lg};
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: ${SPACING.lg} !important;
  
  .ant-tabs-nav {
    margin-bottom: ${SPACING.lg} !important;
  }
  
  .ant-tabs-tab {
    font-size: ${FONT_SIZES.md} !important;
    padding: ${SPACING.sm} ${SPACING.md} !important;
    margin-right: ${SPACING.md} !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      color: ${COLORS.primary} !important;
    }
  }
  
  .ant-tabs-tab-active {
    color: ${COLORS.primary} !important;
    font-weight: ${FONT_WEIGHTS.semibold} !important;
  }
  
  .ant-tabs-ink-bar {
    background: ${COLORS.primary} !important;
    height: 3px !important;
    border-radius: 1.5px !important;
  }
`;

const StyledSearch = styled(Search)`
  width: 400px !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  
  .ant-input {
    border-radius: ${BORDER_RADIUS.md} !important;
    font-size: ${FONT_SIZES.md} !important;
    padding: ${SPACING.sm} ${SPACING.md} !important;
    transition: all 0.2s ease !important;
    
    &:focus {
      border-color: ${COLORS.primary} !important;
      box-shadow: 0 0 0 3px ${COLORS.primaryLight} !important;
    }
  }
  
  .ant-input-search-button {
    border-radius: 0 ${BORDER_RADIUS.md} ${BORDER_RADIUS.md} 0 !important;
    background: ${COLORS.primary} !important;
    border-color: ${COLORS.primary} !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: #2563EB !important;
      border-color: #2563EB !important;
    }
  }
`;

const UploadSection = styled.div`
  margin-top: ${SPACING.md};
  
  .upload-area {
    border: 2px dashed ${COLORS.border} !important;
    border-radius: ${BORDER_RADIUS.md} !important;
    padding: ${SPACING.xl} !important;
    text-align: center !important;
    transition: all 0.2s ease !important;
    background: ${COLORS.white} !important;
    
    &:hover {
      border-color: ${COLORS.primary} !important;
      background: ${COLORS.primaryLight} !important;
    }
  }
`;

const FileCard = styled.div<{ $isSelected: boolean }>`
  background: ${props => props.$isSelected ? COLORS.primaryLight : COLORS.white} !important;
  border: 1px solid ${props => props.$isSelected ? COLORS.primary : COLORS.border} !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  padding: ${SPACING.md} !important;
  margin-bottom: ${SPACING.md} !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  position: relative !important;
  
  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    border-color: ${props => props.$isSelected ? COLORS.primary : COLORS.primaryLight} !important;
    
    .delete-button {
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
  
  .file-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-bottom: ${SPACING.sm} !important;
  }
  
  .file-path {
    font-weight: ${FONT_WEIGHTS.semibold} !important;
    font-size: ${FONT_SIZES.md} !important;
    color: ${props => props.isSelected ? COLORS.primary : COLORS.text} !important;
    margin-right: ${SPACING.md} !important;
    word-break: break-all !important;
  }
  
  .delete-button {
    opacity: 0 !important;
    visibility: hidden !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: ${COLORS.danger} !important;
      border-color: ${COLORS.danger} !important;
    }
  }
  
  .file-meta {
    display: flex !important;
    align-items: center !important;
    gap: ${SPACING.md} !important;
    margin-top: ${SPACING.sm} !important;
  }
  
  .meta-item {
    display: flex !important;
    align-items: center !important;
    gap: ${SPACING.xs} !important;
    font-size: ${FONT_SIZES.sm} !important;
    color: ${COLORS.textSecondary} !important;
  }
`;

const KeyValueItem = styled.div`
  margin: ${SPACING.sm} 0 !important;
  display: flex !important;
  justify-content: space-between !important;
  padding: ${SPACING.sm} !important;
  border-radius: ${BORDER_RADIUS.sm} !important;
  transition: all 0.2s ease !important;
  
  &:hover {
    background: ${COLORS.primaryLight} !important;
  }
`;

const DetailSection = styled.div`
  margin-top: ${SPACING.lg} !important;
  padding: ${SPACING.md} !important;
  background: ${COLORS.white} !important;
  border: 1px solid ${COLORS.border} !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
`;

const DetailCard = styled(Card)`
  margin-bottom: ${SPACING.md} !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  border: 1px solid ${COLORS.border} !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  
  .ant-card-head {
    border-bottom: 1px solid ${COLORS.border} !important;
    padding: ${SPACING.sm} ${SPACING.md} !important;
  }
  
  .ant-card-head-title {
    font-size: ${FONT_SIZES.md} !important;
    font-weight: ${FONT_WEIGHTS.semibold} !important;
    color: ${COLORS.text} !important;
  }
  
  .ant-card-body {
    padding: ${SPACING.md} !important;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: ${SPACING.md} !important;
`;

const InfoRow = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: ${SPACING.sm} !important;
  border-radius: ${BORDER_RADIUS.sm} !important;
  transition: all 0.2s ease !important;
  
  &:hover {
    background: ${COLORS.primaryLight} !important;
  }
  
  .info-label {
    font-weight: ${FONT_WEIGHTS.medium} !important;
    color: ${COLORS.text} !important;
  }
  
  .info-value {
    color: ${COLORS.textSecondary} !important;
    display: flex !important;
    align-items: center !important;
    gap: ${SPACING.xs} !important;
  }
`;

const FilePathWrapper = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: ${SPACING.xs} !important;
  flex-wrap: wrap !important;
  
  .file-path-text {
    max-width: 300px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
`;

const StyledButton = styled(Button)`
  ${buttonStyles}
`;

const PrimaryButton = styled(Button)`
  ${buttonStyles}
  background: ${COLORS.primary} !important;
  border-color: ${COLORS.primary} !important;
  color: ${COLORS.white} !important;
  
  &:hover {
    background: #2563EB !important;
    border-color: #2563EB !important;
  }
`;

const ActionButtons = styled.div`
  display: flex !important;
  gap: ${SPACING.sm} !important;
  margin-top: ${SPACING.md} !important;
  flex-wrap: wrap !important;
  
  .primary-action {
    flex: 1 !important;
    min-width: 120px !important;
  }
`;

// 文件类型图标映射
const getFileTypeIcon = (fileType: string) => {
  if (fileType.includes('image')) {
    return <FileImageOutlined />;
  } else if (fileType.includes('video')) {
    return <VideoCameraOutlined />;
  } else if (fileType.includes('pdf')) {
    return <FilePdfOutlined />;
  } else if (fileType.includes('text') || fileType.includes('markdown')) {
    return <FileTextOutlined />;
  } else {
    return <FileOutlined />;
  }
};

// 截断文件路径
const truncateFilePath = (filePath: string, maxLength: number = 50) => {
  if (filePath.length <= maxLength) {
    return filePath;
  }
  const parts = filePath.split('/');
  if (parts.length <= 2) {
    return filePath.substring(0, maxLength - 3) + '...';
  }
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];
  const middleLength = maxLength - firstPart.length - lastPart.length - 6; // 6 for '.../...'
  if (middleLength <= 0) {
    return firstPart.substring(0, maxLength - lastPart.length - 3) + '...' + lastPart;
  }
  return firstPart + '/.../' + lastPart;
};

const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const { categories, definitions } = useSelector((state: RootState) => state.key);
  const { items, searchResults, selectedItem } = useSelector((state: RootState) => state.knowledge);
  
  // 检查items数组
  useEffect(() => {
    console.log('Items:', items);
  }, [items]);
  const [keyManagerVisible, setKeyManagerVisible] = useState(false);
  const [aiAssistantVisible, setAIAssistantVisible] = useState(false);
  const [mediaPreviewVisible, setMediaPreviewVisible] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [searchValue, setSearchValue] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormValues, setEditFormValues] = useState<any>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('click_count');
  const [activeTab, setActiveTab] = useState<'recommend' | 'all' | 'search'>('recommend');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadFormVisible, setUploadFormVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 组件挂载时从后端加载数据
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // 清空现有数据
        dispatch(clearKnowledgeItems());
        
        // 加载知识项
        const knowledgeResponse = await fetch('http://localhost:3000/api/knowledge');
        if (knowledgeResponse.ok && isMounted) {
          const knowledgeData = await knowledgeResponse.json();
          console.log('Backend data:', knowledgeData);
          // 添加加载的数据
          knowledgeData.forEach((item: any) => {
            dispatch(addKnowledgeItem({
              id: item.id,
              filePath: item.filePath,
              fileType: item.fileType,
              createdAt: item.createdAt,
              clickCount: item.clickCount,
              starRating: item.starRating,
              keyValues: item.keyValues,
            }));
          });
        }

        // 加载分类
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        if (categoriesResponse.ok && isMounted) {
          const categoriesData = await categoriesResponse.json();
          dispatch(setCategories(categoriesData));
        }

        // 加载key定义
        const keysResponse = await fetch('http://localhost:3000/api/keys');
        if (keysResponse.ok && isMounted) {
          const keysData = await keysResponse.json();
          dispatch(setDefinitions(keysData));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
          message.error('加载数据失败，请确保后端服务已在 http://localhost:3000 启动');
        }
      }
    };

    loadData();
    
    // 清理函数，防止组件卸载后执行
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    // 解析搜索语法: key:pattern; key:pattern;
    const searchTerms = value.split(';').map(term => term.trim()).filter(term => term);
    
    let results = [...items];
    
    if (searchTerms.length > 0) {
      results = results.filter(item => {
        // 1. 先过滤掉本身就是空的 item
        if (!item) return false;
        
        return searchTerms.every(term => {
          const colonIndex = term.indexOf(':');
          if (colonIndex === -1) {
            // 无pattern时，强调这个key（只有这个key有数值才放入）
            const keyName = term.trim();
            // 查找对应的key定义
            const keyDef = definitions.find(def => def.name === keyName);
            if (keyDef) {
              // 检查item是否有这个key的值
              const hasKey = item.keyValues?.some(kv => kv?.keyId === keyDef.id && kv?.value);
              return hasKey || false;
            }
            return false;
          } else {
            // key:pattern 格式
            const keyName = term.substring(0, colonIndex).trim();
            const pattern = term.substring(colonIndex + 1).trim();
            
            // 查找对应的key定义
            const keyDef = definitions.find(def => def.name === keyName);
            if (keyDef) {
              // 检查item是否有匹配的key值
              const hasMatch = item.keyValues?.some(kv => {
                if (kv?.keyId === keyDef.id && kv?.value) {
                  return kv.value.match(new RegExp(pattern, 'i'));
                }
                return false;
              });
              return hasMatch || false;
            }
            
            // 对于内置属性（如filePath, fileType等）
            if (keyName === 'filePath' && item.filePath) {
              return item.filePath.match(new RegExp(pattern, 'i'));
            }
            if (keyName === 'fileType' && item.fileType) {
              return item.fileType.match(new RegExp(pattern, 'i'));
            }
            if (keyName === 'starRating' && item.starRating !== undefined) {
              return item.starRating.toString().match(new RegExp(pattern, 'i'));
            }
            if (keyName === 'clickCount' && item.clickCount !== undefined) {
              return item.clickCount.toString().match(new RegExp(pattern, 'i'));
            }
            if (keyName === 'createdAt' && item.createdAt) {
              return item.createdAt.match(new RegExp(pattern, 'i'));
            }
            
            return false;
          }
        });
      });
    }
    
    // 应用排序
    if (sortBy === 'click_count') {
      results.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    } else if (sortBy === 'star_rating') {
      results.sort((a, b) => (b.starRating || 0) - (a.starRating || 0));
    }
    
    dispatch(setSearchResults(results));
  };

  const handleItemClick = async (itemId: string) => {
    dispatch(selectItem(itemId));
    setSelectedItemId(itemId);
    // 获取当前点击次数
    const item = items.find(i => i.id === itemId);
    if (item) {
      // 从 keyValues 中获取 click_count
      const clickCountKv = item.keyValues?.find((kv: any) => kv.keyId === '3');
      const currentClickCount = clickCountKv?.value || 0;
      const newClickCount = currentClickCount + 1;
      
      try {
        // 更新 keyValues 中的 click_count
        const updatedKeyValues = item.keyValues?.map((kv: any) => 
          kv.keyId === '3' ? { ...kv, value: newClickCount } : kv
        ) || [{ keyId: '3', value: newClickCount }];
        
        const response = await fetch(`http://localhost:3000/api/knowledge/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyValues: updatedKeyValues }),
        });
        if (response.ok) {
          dispatch(incrementClickCount(itemId));
        }
      } catch (error) {
        console.error('Error updating click count:', error);
      }
    }
  };

  const openFileLocation = (filePath: string) => {
    // 生成文件所在文件夹的路径
    const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
    
    // 检查是否在Electron环境中
    if (window.electronAPI && window.electronAPI.openFileLocation) {
      try {
        window.electronAPI.openFileLocation(filePath);
        message.info('正在打开文件所在文件夹...');
      } catch (error) {
        console.error('Error opening folder:', error);
        message.error('打开文件夹失败');
      }
    } else {
      // 非Electron环境，显示路径给用户
      message.info(`文件所在文件夹: ${folderPath}\n请手动打开此路径`);
    }
  };

  const handleMediaPreview = (filePath: string, fileType: string) => {
    setMediaUrl(filePath);
    setMediaType(fileType.includes('image') ? 'image' : 'video');
    setMediaPreviewVisible(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newItem = await response.json();
        // 设置编辑项和表单值，准备打开编辑模态框
        setEditingItem(newItem);
        // 构建表单值，从 keyValues 中提取数据
        const formValues: any = {};
        newItem.keyValues?.forEach((kv: any) => {
          const keyDef = definitions.find(def => def.id === kv.keyId);
          if (keyDef) {
            formValues[keyDef.name] = kv.value;
          }
        });
        setEditFormValues(formValues);
        // 打开编辑模态框
        setEditFormVisible(true);
        message.info('请编辑文件属性');
      } else {
        message.error('文件上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('文件上传失败');
    }
  };

  // 构建分类树
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
            Key管理
          </span>
        ),
        onClick: () => setKeyManagerVisible(true),
        style: {
          backgroundColor: '#e6f7ff',
          marginBottom: '8px',
          borderRadius: '4px',
        }
      },
      ...categories
        .filter(cat => cat.parentId === null)
        .map(cat => {
          // 获取直接属于该分类的key
          const directKeyItems = definitions
            .filter(def => def.categoryId === cat.id)
            .map(def => ({
              key: `key-${def.id}`,
              label: def.name,
              onClick: () => {
                // 点击key后自动在搜索栏添加该key
                const newSearchValue = searchValue ? `${searchValue}; ${def.name}` : def.name;
                setSearchValue(newSearchValue);
                handleSearch(newSearchValue);
                // 跳转到搜索标签页
                setActiveTab('search');
                // 设置选中的key
                setSelectedKey(def.id);
              },
            }));
          
          // 获取该分类的子分类
          const children = categories
            .filter(child => child.parentId === cat.id)
            .map(child => {
              const keyItems = definitions
                .filter(def => def.categoryId === child.id)
                .map(def => ({
                  key: `key-${def.id}`,
                  label: def.name,
                  onClick: () => {
                    // 点击key后自动在搜索栏添加该key
                    const newSearchValue = searchValue ? `${searchValue}; ${def.name}` : def.name;
                    setSearchValue(newSearchValue);
                    handleSearch(newSearchValue);
                    // 跳转到搜索标签页
                    setActiveTab('search');
                    // 设置选中的key
                    setSelectedKey(def.id);
                  },
                }));
              return {
                key: `cat-${child.id}`,
                label: child.name,
                children: keyItems.length > 0 ? keyItems : undefined,
              };
            });
          
          // 合并直接属于该分类的key和子分类
          const allChildren = [...directKeyItems, ...children];
          
          return {
            key: `cat-${cat.id}`,
            label: cat.name,
            children: allChildren.length > 0 ? allChildren : undefined,
          };
        })
    ];
    return menuItems;
  };

  // 处理编辑文件参数
  const handleEditItem = (item: any) => {
    setEditingItem(item);
    const formValues = item.keyValues.reduce((acc: any, kv: any) => {
      const keyDef = definitions.find(def => def.id === kv.keyId);
      if (keyDef) {
        acc[keyDef.name] = kv.value;
      }
      return acc;
    }, {});
    setEditFormValues(formValues);
    setEditFormVisible(true);
  };

  // 处理编辑表单提交
  const handleEditSubmit = async () => {
    if (editingItem) {
      // 构建更新后的 keyValues
      const updatedKeyValues = definitions.map(def => {
        const value = editFormValues[def.name];
        if (value !== undefined) {
          return {
            keyId: def.id,
            value: value
          };
        }
        return null;
      }).filter((kv: any) => kv !== null);
      
      const updatedItem = {
        ...editingItem,
        keyValues: updatedKeyValues
      };
      
      try {
        // 调用 API 更新数据
        const response = await fetch(`http://localhost:3000/api/knowledge/${updatedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedItem),
        });
        
        if (response.ok) {
          // 更新 Redux store
          dispatch(updateKnowledgeItem(updatedItem));
          message.success('文件参数更新成功');
        } else {
          message.error('文件参数更新失败');
        }
      } catch (error) {
        console.error('Error updating knowledge item:', error);
        message.error('文件参数更新失败');
      }
      
      setEditFormVisible(false);
      setEditingItem(null);
      setEditFormValues({});
    }
  };

  // 处理删除文件
  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/knowledge/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        dispatch(deleteKnowledgeItem(itemId));
        message.success('文件删除成功');
      } else {
        message.error('文件删除失败');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('文件删除失败');
    }
  };

  // 处理拖拽上传
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData,
        })
        .then(response => response.json())
        .then(newItem => {
          dispatch(addKnowledgeItem({
            filePath: newItem.filePath,
            fileType: newItem.fileType,
            createdAt: newItem.createdAt,
            clickCount: newItem.clickCount,
            starRating: newItem.starRating,
            keyValues: newItem.keyValues,
          }));
          message.success('文件上传成功');
        })
        .catch(error => {
          console.error('Upload error:', error);
          message.error('文件上传失败');
        });
      } catch (error) {
        console.error('Upload error:', error);
        message.error('文件上传失败');
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <StyledLayout>
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
        <AntLayout>
          <StyledSider width={256}>
            <StyledMenu
              mode="inline"
              defaultOpenKeys={['1', '8']}
              items={buildMenuItems()}
            />
          </StyledSider>
          <StyledContent>
            <StyledTabs 
              activeKey={activeTab} 
              onChange={(key) => setActiveTab(key as 'recommend' | 'all' | 'search')}
              items={[
                { key: 'recommend', label: '推荐' },
                { key: 'all', label: '全部' },
                { key: 'search', label: '搜索' }
              ]}
            />
            
            <SearchSection>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <StyledSearch
                  placeholder="输入搜索关键词，支持key:pattern; 格式"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={(value) => {
                    handleSearch(value);
                    setActiveTab('search');
                  }}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  value={searchValue}
                />
                <Space>
                  <Select 
                    defaultValue="click_count" 
                    style={{ width: 120 }} 
                    onChange={(value) => {
                      setSortBy(value);
                      handleSearch(searchValue);
                      setActiveTab('search');
                    }}
                  >
                    <Option value="click_count">按点击次数</Option>
                    <Option value="star_rating">按星级</Option>
                  </Select>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <StyledButton 
                    icon={<UploadOutlined />}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    导入文件
                  </StyledButton>
                </Space>
                
                <UploadSection>
                  <div 
                    className="upload-area"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={dragActive ? { borderColor: COLORS.primary, background: COLORS.primaryLight } : {}}
                  >
                    <p>拖拽文件到此处上传</p>
                    <p style={{ fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs }}>
                      支持图片、视频等多种文件格式
                    </p>
                  </div>
                </UploadSection>
              </Space>
            </SearchSection>
            
            {activeTab === 'recommend' && (
              <ResultsSection>
                <h3 style={{ marginBottom: SPACING.md, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold }}>推荐结果</h3>
                {items.length > 0 ? (
                  [...items]
                    .filter(item => item && item.filePath) // 过滤掉没有 filePath 的无效数据
                    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                    .slice(0, 5)
                    .map(item => (
                      <FileCard key={item.id} $$isSelected={selectedItemId === item.id}>
                        <div className="file-header">
                          <div className="file-path" onClick={() => handleItemClick(item.id)}>
                            {/* 优先显示 file_name，如果没有则显示 file_path */}
                            {item.keyValues?.find((kv: any) => kv.keyId === '11')?.value || item.filePath}
                          </div>
                          <Button 
                            className="delete-button"
                            danger 
                            size="small"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            删除
                          </Button>
                        </div>
                        <div className="file-meta">
                          <div className="meta-item">
                            <EyeFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '3')?.value || 0}
                          </div>
                          <div className="meta-item">
                            <StarFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '10')?.value || 0}
                          </div>
                          <div className="meta-item">
                            {item.keyValues?.find((kv: any) => kv.keyId === '2')?.value || item.fileType}
                          </div>
                        </div>
                      </FileCard>
                    ))
                ) : (
                  <div style={{ padding: SPACING.lg, textAlign: 'center', color: COLORS.textSecondary, background: COLORS.white, borderRadius: BORDER_RADIUS.md, border: `1px solid ${COLORS.border}` }}>
                    暂无结果
                  </div>
                )}
              </ResultsSection>
            )}
            
            {activeTab === 'all' && (
              <ResultsSection>
                <h3 style={{ marginBottom: SPACING.md, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold }}>全部文件</h3>
                {items.length > 0 ? (
                  items
                    .filter(item => item && item.filePath) // 过滤掉没有 filePath 的无效数据
                    .map(item => (
                    <FileCard key={item.id} $isSelected={selectedItemId === item.id}>
                      <div className="file-header">
                        <div className="file-path" onClick={() => handleItemClick(item.id)}>
                          {/* 优先显示 file_name，如果没有则显示 file_path */}
                          {item.keyValues?.find((kv: any) => kv.keyId === '11')?.value || item.filePath}
                        </div>
                        <Button 
                          className="delete-button"
                          danger 
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          删除
                        </Button>
                      </div>
                      <div className="file-meta">
                        <div className="meta-item">
                          <EyeFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '3')?.value || 0}
                        </div>
                        <div className="meta-item">
                          <StarFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '10')?.value || 0}
                        </div>
                        <div className="meta-item">
                          {item.keyValues?.find((kv: any) => kv.keyId === '2')?.value || item.fileType}
                        </div>
                      </div>
                    </FileCard>
                  ))
                ) : (
                  <div style={{ padding: SPACING.lg, textAlign: 'center', color: COLORS.textSecondary, background: COLORS.white, borderRadius: BORDER_RADIUS.md, border: `1px solid ${COLORS.border}` }}>
                    暂无结果
                  </div>
                )}
              </ResultsSection>
            )}
            
            {activeTab === 'search' && (
              <ResultsSection>
                <h3 style={{ marginBottom: SPACING.md, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold }}>搜索结果</h3>
                {searchResults.length > 0 ? (
                  searchResults
                    .filter(item => item && item.filePath) // 过滤掉没有 filePath 的无效数据
                    .map(item => (
                    <FileCard key={item.id} $isSelected={selectedItemId === item.id}>
                      <div className="file-header">
                        <div className="file-path" onClick={() => handleItemClick(item.id)}>
                          {/* 优先显示 file_name，如果没有则显示 file_path */}
                          {item.keyValues?.find((kv: any) => kv.keyId === '11')?.value || item.filePath}
                        </div>
                        <Button 
                          className="delete-button"
                          danger 
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          删除
                        </Button>
                      </div>
                      <div className="file-meta">
                        <div className="meta-item">
                          <EyeFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '3')?.value || 0}
                        </div>
                        <div className="meta-item">
                          <StarFilled /> {item.keyValues?.find((kv: any) => kv.keyId === '10')?.value || 0}
                        </div>
                        <div className="meta-item">
                          {item.keyValues?.find((kv: any) => kv.keyId === '2')?.value || item.fileType}
                        </div>
                      </div>
                    </FileCard>
                  ))
                ) : (
                  <div style={{ padding: SPACING.lg, textAlign: 'center', color: COLORS.textSecondary, background: COLORS.white, borderRadius: BORDER_RADIUS.md, border: `1px solid ${COLORS.border}` }}>
                    暂无结果
                  </div>
                )}
              </ResultsSection>
            )}
            
            {selectedItem ? (
              <DetailSection>
                <h3 style={{ marginBottom: SPACING.md, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold }}>文件详情</h3>
                
                {/* 基本信息卡片 */}
                <DetailCard title="基本信息">
                  <InfoRow>
                    <span className="info-label">文件路径:</span>
                    <FilePathWrapper>
                      <Tooltip title={selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value}>
                        <span className="file-path-text">{truncateFilePath(selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value || '')}</span>
                      </Tooltip>
                      <Tooltip title="复制路径">
                        <Button 
                          type="text" 
                          icon={<CopyOutlined />} 
                          size="small"
                          onClick={() => {
                            const filePath = selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value;
                            if (filePath) {
                              navigator.clipboard.writeText(filePath);
                              message.success('路径已复制');
                            }
                          }}
                        />
                      </Tooltip>
                    </FilePathWrapper>
                  </InfoRow>
                  <InfoRow>
                    <span className="info-label">文件类型:</span>
                    <span className="info-value">
                      {getFileTypeIcon(selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value || '')}
                      {selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value}
                    </span>
                  </InfoRow>
                  <InfoRow>
                    <span className="info-label">创建时间:</span>
                    <span className="info-value">{selectedItem.createdAt}</span>
                  </InfoRow>
                </DetailCard>
                
                {/* 互动数据卡片 */}
                <DetailCard title="互动数据">
                  <InfoRow>
                    <span className="info-label">点击次数:</span>
                    <span className="info-value">
                      <FireOutlined style={{ color: '#F59E0B' }} />
                      {selectedItem.clickCount || selectedItem.keyValues?.find((kv: any) => kv.keyId === '3')?.value || 0}
                    </span>
                  </InfoRow>
                  <InfoRow>
                    <span className="info-label">星级评分:</span>
                    <Rate 
                      value={selectedItem.starRating || selectedItem.keyValues?.find((kv: any) => kv.keyId === '10')?.value || 0} 
                      onChange={(value) => {
                        // 更新 keyValues 中的 star_rating
                        const updatedKeyValues = selectedItem.keyValues?.map((kv: any) => 
                          kv.keyId === '10' ? { ...kv, value } : kv
                        ) || [{ keyId: '10', value }];
                        
                        const updatedItem = {
                          ...selectedItem,
                          keyValues: updatedKeyValues
                        };
                        dispatch(updateKnowledgeItem(updatedItem));
                        message.success('星级评分已更新');
                      }}
                    />
                  </InfoRow>
                </DetailCard>
                
                {/* 自定义属性卡片 */}
                {definitions.filter(def => !def.isBuiltin).length > 0 && (
                  <DetailCard title="自定义属性">
                    {definitions.filter(def => !def.isBuiltin).map(def => {
                      const keyValue = selectedItem.keyValues?.find((kv: any) => kv.keyId === def.id);
                      if (keyValue && keyValue.value) {
                        const isSelected = selectedKey === def.id;
                        return (
                          <InfoRow 
                            key={def.id} 
                            style={isSelected ? { backgroundColor: COLORS.primaryLight } : {}}
                          >
                            <span style={isSelected ? { fontWeight: FONT_WEIGHTS.semibold, color: COLORS.primary } : {}} className="info-label">{def.name}:</span>
                            <span style={isSelected ? { fontWeight: FONT_WEIGHTS.semibold, color: COLORS.primary } : {}} className="info-value">{keyValue.value}</span>
                          </InfoRow>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </DetailCard>
                )}
                
                {/* 操作按钮 */}
                {(selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value) && (
                  <ActionButtons>
                    <PrimaryButton 
                      className="primary-action"
                      onClick={() => openFileLocation(selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value || '')}
                    >
                      打开所在文件夹
                    </PrimaryButton>
                    <StyledButton 
                      icon={<EditOutlined />}
                      onClick={() => handleEditItem(selectedItem)}
                    >
                      编辑参数
                    </StyledButton>
                    <Popconfirm
                      title="确定要删除这个文件吗？"
                      description="此操作不可恢复"
                      onConfirm={() => handleDeleteItem(selectedItem.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        danger
                        icon={<DeleteOutlined />}
                      >
                        删除文件
                      </Button>
                    </Popconfirm>
                    {((selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value)?.includes('image') || 
                      (selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value)?.includes('video')) && (
                      <StyledButton 
                        icon={(selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value)?.includes('image') ? <PictureOutlined /> : <VideoCameraOutlined />}
                        onClick={() => handleMediaPreview(selectedItem.filePath || selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value || '', 
                                  selectedItem.fileType || selectedItem.keyValues?.find((kv: any) => kv.keyId === '2')?.value || '')}
                      >
                        预览
                      </StyledButton>
                    )}
                  </ActionButtons>
                )}
              </DetailSection>
            ) : (
              <DetailSection>
                <div style={{ padding: SPACING.xl, textAlign: 'center', color: COLORS.textSecondary }}>
                  <p style={{ fontSize: FONT_SIZES.lg, marginBottom: SPACING.md }}>请点击左侧文件查看详情</p>
                  <p style={{ fontSize: FONT_SIZES.sm }}>从推荐结果、全部文件或搜索结果中选择一个文件，查看其详细信息</p>
                </div>
              </DetailSection>
            )}
          </StyledContent>
        </AntLayout>
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
          title="编辑文件参数"
          open={editFormVisible}
          onCancel={() => setEditFormVisible(false)}
          onOk={handleEditSubmit}
          width={500}
          style={{
            borderRadius: BORDER_RADIUS.md,
          }}
        >
          <Form layout="vertical">
            {definitions.map(def => {
              // 跳过内置的 click_count，因为它是自动计算的
              if (def.name === 'click_count') return null;
              
              // 根据数据类型渲染不同的组件
              if (def.name === 'star_rating') {
                return (
                  <Form.Item key={def.id} label={def.description || def.name}>
                    <Rate 
                      value={editFormValues[def.name] || 0} 
                      onChange={(value) => setEditFormValues({...editFormValues, [def.name]: value})} 
                    />
                  </Form.Item>
                );
              } else if (def.name === 'file_path') {
                return (
                  <Form.Item key={def.id} label={def.description || def.name}>
                    <Input 
                      value={editFormValues[def.name] || ''} 
                      onChange={(e) => setEditFormValues({...editFormValues, [def.name]: e.target.value})} 
                      disabled 
                      style={{
                        borderRadius: BORDER_RADIUS.md,
                        backgroundColor: '#f5f5f5',
                      }}
                    />
                  </Form.Item>
                );
              } else {
                return (
                  <Form.Item 
                    key={def.id} 
                    label={def.description || def.name}
                    required={def.isRequired}
                  >
                    <Input 
                      value={editFormValues[def.name] || ''} 
                      onChange={(e) => setEditFormValues({...editFormValues, [def.name]: e.target.value})} 
                      placeholder={`请输入${def.description || def.name}`}
                      style={{
                        borderRadius: BORDER_RADIUS.md,
                      }}
                    />
                  </Form.Item>
                );
              }
            })}
          </Form>
        </Modal>
      </StyledLayout>
    </>
  );
};

export default Layout;
