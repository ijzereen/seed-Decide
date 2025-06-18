import React, { useState, useEffect } from 'react';
import './NodeEditor.css';
import useTranslation from '../hooks/useTranslation';

const NodeEditor = ({ node, nodes, edges, gameConfig, onSave, onClose, onGenerateStory }) => {
  const { t } = useTranslation();
  const [nodeData, setNodeData] = useState({
    label: '',
    story: '',
    choice: '',
    imageUrl: '',
    statChanges: {
      health: 0,
      wealth: 0,
      happiness: 0,
      power: 0
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (node) {
      setNodeData({
        label: node.data.label || '',
        story: node.data.story || '',
        choice: node.data.choice || '',
        imageUrl: node.data.imageUrl || '',
        statChanges: node.data.statChanges || {
          health: 0,
          wealth: 0,
          happiness: 0,
          power: 0
        }
      });
      
      if (node.data.imageUrl) {
        setImagePreview(node.data.imageUrl); // Base64 데이터 직접 사용
      } else {
        setImagePreview(null);
      }
    }
  }, [node]);

  const handleSave = () => {
    onSave({
      ...node,
      data: {
        ...node.data,
        label: nodeData.label,
        story: nodeData.story,
        choice: nodeData.choice,
        imageUrl: nodeData.imageUrl,
        statChanges: nodeData.statChanges
      }
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatChange = (statKey, value) => {
    setNodeData(prev => ({
      ...prev,
      statChanges: {
        ...prev.statChanges,
        [statKey]: value
      }
    }));
  };

  const getNodeRelations = () => {
    const parents = edges
      .filter(edge => edge.target === node.id)
      .map(edge => nodes.find(n => n.id === edge.source))
      .filter(Boolean);
    
    const children = edges
      .filter(edge => edge.source === node.id)
      .map(edge => nodes.find(n => n.id === edge.target))
      .filter(Boolean);

    return { parents, children };
  };

  const handleGenerateStory = async () => {
    if (!onGenerateStory) {
      alert(t('storyGenerationUnavailable'));
      return;
    }

    setIsGenerating(true);
    try {
      const { parents, children } = getNodeRelations();
      
      const currentNodeWithUpdatedData = {
        ...node,
        data: {
          ...node.data,
          label: nodeData.label,
          story: nodeData.story,
          choice: nodeData.choice,
          imageUrl: nodeData.imageUrl,
          statChanges: nodeData.statChanges
        }
      };

      await onGenerateStory({
        currentNode: currentNodeWithUpdatedData,
        parentNodes: parents,
        childNodes: children,
        gameConfig: gameConfig,
        allNodes: nodes,
        allEdges: edges
      });

    } catch (error) {
      console.error('스토리 생성 실패:', error);
      alert(t('storyGenerationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Image upload started:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      alert(t('imageFilesOnly'));
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB로 제한 (Base64로 저장하므로)
    if (file.size > maxSize) {
      alert(t('fileSizeLimit'));
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // FileReader를 사용해 Base64로 변환
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Data = e.target.result;
        
        // 노드 데이터에 Base64 이미지 저장
        setNodeData(prev => ({
          ...prev,
          imageUrl: base64Data // Base64 데이터 직접 저장
        }));
        
        setImagePreview(base64Data);
        setIsUploadingImage(false);
        alert(t('imageUploadSuccess'));
      };
      
      reader.onerror = () => {
        console.error('File reading failed');
        alert(t('imageUploadError'));
        setIsUploadingImage(false);
      };
      
      // Base64로 읽기 시작
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(t('imageUploadError') + `: ${error.message}`);
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    if (!nodeData.imageUrl) return;
    
    // 로컬 저장이므로 단순히 데이터에서 제거
    setNodeData(prev => ({
      ...prev,
      imageUrl: ''
    }));
    
    setImagePreview(null);
  };

  if (!node) return null;

  return (
    <div className="node-editor-overlay">
      <div className="node-editor">
        <div className="editor-header">
          <h3>{t('nodeEditor')}</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="editor-content">
          <div className="form-group">
            <label htmlFor="node-label">{t('nodeTitle')}</label>
            <input
              id="node-label"
              type="text"
              value={nodeData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder={t('enterNodeTitle')}
            />
          </div>

          <div className="form-group">
            <div className="story-header">
              <label htmlFor="node-story">{t('story')}</label>
              <button 
                className="generate-story-button"
                onClick={handleGenerateStory}
                disabled={isGenerating}
                type="button"
              >
                {isGenerating ? '🔄 ' + t('generating') + '...' : '✨ ' + t('generateStory')}
              </button>
            </div>
            <textarea
              id="node-story"
              value={nodeData.story}
              onChange={(e) => handleInputChange('story', e.target.value)}
              placeholder={t('writeStoryHere')}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="node-choice">{t('choice')}</label>
            <input
              id="node-choice"
              type="text"
              value={nodeData.choice}
              onChange={(e) => handleInputChange('choice', e.target.value)}
              placeholder={t('choiceTextOptional')}
            />
          </div>

          <div className="form-group">
            <label>🖼️ {t('imageUpload')}</label>
            <div className="image-upload-section">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img 
                    src={imagePreview} 
                    alt={t('storyImagePreview')} 
                    className="image-preview"
                  />
                  <div className="image-actions">
                    <label className="image-upload-button">
                      🔄 {t('changeImage')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button 
                      type="button"
                      className="image-remove-button"
                      onClick={handleImageRemove}
                      disabled={isUploadingImage}
                    >
                      🗑️ {t('delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="image-upload-container">
                  <label className="image-upload-button">
                    {isUploadingImage ? '📤 ' + t('uploading') + '...' : '📷 ' + t('addImage')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <small className="image-help">
                    {t('imageHelp')}<br/>
                    {t('imageFormats')}
                  </small>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>{t('statChanges')}</label>
            <div className="stat-changes-grid">
              {Object.entries(nodeData.statChanges).map(([statKey, value]) => {
                const statIcons = gameConfig?.statIcons || {
                  health: '❤️',
                  wealth: '💰',
                  happiness: '😊',
                  power: '👑'
                };
                const statNames = gameConfig?.statNames || {
                  health: t('stat') + ' 1',
                  wealth: t('stat') + ' 2',
                  happiness: t('stat') + ' 3',
                  power: t('stat') + ' 4'
                };
                return (
                  <div key={statKey} className="stat-change-item">
                    <label>{statIcons[statKey]} {statNames[statKey]}</label>
                    <input
                      type="number"
                      min="-50"
                      max="50"
                      value={value}
                      onChange={(e) => handleStatChange(statKey, parseInt(e.target.value) || 0)}
                      className="stat-input"
                    />
                  </div>
                );
              })}
            </div>
            <div className="stat-help">
              <small>{t('statChangeRange')}</small>
            </div>
          </div>

          <div className="editor-help">
            <h4>💡 {t('usageTips')}</h4>
            <ul>
              <li><strong>{t('nodeTitle')}:</strong> {t('usageTipItems.nodeTitle')}</li>
              <li><strong>{t('storyContent')}:</strong> {t('usageTipItems.storyContent')}</li>
              <li><strong>{t('choiceText')}:</strong> {t('usageTipItems.choiceText')}</li>
              <li><strong>{t('statChanges')}:</strong> {t('usageTipItems.statChanges')}</li>
            </ul>
          </div>
        </div>

        <div className="editor-actions">
          <button className="cancel-button" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="save-button" onClick={handleSave}>
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
