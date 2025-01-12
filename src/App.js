import React, { useState } from 'react';
import { Upload, Button, message, Row, Col, Card, Modal, List, Spin } from 'antd';
import { InboxOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components'; // 引入 styled-components

const { Dragger } = Upload;

// 使用 styled-components 定义样式
const StyledLogButton = styled(Button)`
  background-color: #fff; /* 默认背景色 */
  border-color: #eee; /* 默认边框颜色 */
  color: #ddd; /* 默认文字颜色 */
  transition: all 0.3s; /* 过渡效果 */

  &:hover {
    background-color: #f5f5f5; /* 悬停时背景色 */
    border-color: #111; /* 悬停时边框颜色 */
    color: #111; /* 悬停时文字颜色 */
  }
`;

// 拖拽区域的样式
const DropzoneContainer = styled.div`
  border: 2px dashed #1890ff;
  border-radius: 8px; /* 添加圆角 */
  padding: 20px;
  text-align: center;
  cursor: pointer;
`;

const App = () => {
  const [fileList1, setFileList1] = useState([]);
  const [fileList2, setFileList2] = useState([]);
  const [resultFile, setResultFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 新增状态：是否正在处理

  // 将文件转换为 Ant Design Upload 所需的格式
  const normalizeFile = (file) => ({
    uid: file.name, // 使用文件名作为唯一标识
    name: file.name,
    status: 'done', // 设置为已完成状态
    originFileObj: file, // 保留原始文件对象
  });

  // 处理拖拽上传
  const onDrop1 = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const normalizedFile = normalizeFile(acceptedFiles[0]);
      setFileList1([normalizedFile]);
    }
  };
  const onDrop2 = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const normalizedFile = normalizeFile(acceptedFiles[0]);
      setFileList2([normalizedFile]);
    }
  };

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({ onDrop: onDrop1 });
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({ onDrop: onDrop2 });

  // 处理按钮上传
  const handleUpload1 = ({ fileList }) => setFileList1(fileList);
  const handleUpload2 = ({ fileList }) => setFileList2(fileList);

  // 处理文件
  const handleProcess = async () => {
    if (fileList1.length === 0 || fileList2.length === 0) {
      message.error('请上传两个文件');
      return;
    }

    setIsProcessing(true); // 开始处理，显示加载动画

    const formData = new FormData();
    formData.append('file1', fileList1[0].originFileObj);
    formData.append('file2', fileList2[0].originFileObj);

    try {
      const response = await fetch('/process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setResultFile(result.filePath);
        message.success('处理成功');
      } else {
        message.error('处理失败');
      }
    } catch (error) {
      message.error('处理失败');
    } finally {
      setIsProcessing(false); // 处理完成，隐藏加载动画
    }
  };

  // 下载结果文件
  const handleDownload = () => {
    if (resultFile) {
      window.location.href = `/download?filePath=${resultFile}`;
    }
  };

  // 获取日志
  const fetchLogs = async () => {
    try {
      const response = await fetch('/get_logs');
      if (response.ok) {
        const data = await response.json();
        console.log('Logs data:', data); // 调试信息
        setLogs(data.logs);
        setIsLogModalVisible(true);
      } else {
        message.error('获取日志失败');
      }
    } catch (error) {
      console.error('Error fetching logs:', error); // 调试信息
      message.error('获取日志失败');
    }
  };

  return (
    <div style={{ padding: '24px', paddingBottom: '100px' }}> {/* 增加底部 padding，避免内容被按钮遮挡 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="上传无线接口连线配置信息" bordered={false}>
            <DropzoneContainer {...getRootProps1()}>
              <input {...getInputProps1()} />
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            </DropzoneContainer>
            <div style={{ marginTop: '16px' }}>
              <Upload fileList={fileList1} onChange={handleUpload1} beforeUpload={() => false}>
                <Button icon={<InboxOutlined />}>选择文件</Button>
              </Upload>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="上传光模块诊断信息" bordered={false}>
            <DropzoneContainer {...getRootProps2()}>
              <input {...getInputProps2()} />
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            </DropzoneContainer>
            <div style={{ marginTop: '16px' }}>
              <Upload fileList={fileList2} onChange={handleUpload2} beforeUpload={() => false}>
                <Button icon={<InboxOutlined />}>选择文件</Button>
              </Upload>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 固定在底部的按钮栏 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          padding: '16px',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <StyledLogButton
          icon={<FileTextOutlined />}
          onClick={fetchLogs}
          size="large"
        >
          查看日志
        </StyledLogButton>
        <Spin spinning={isProcessing}>
          {resultFile && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              size="large"
              style={{ marginRight: '16px' }}
            >
              下载结果
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleProcess}
            size="large"
            disabled={isProcessing || fileList1.length === 0 || fileList2.length === 0}
          >
            处理文件
          </Button>
        </Spin>
      </div>

      {/* 控制台日志弹出框 */}
      <Modal
        title="控制台日志"
        open={isLogModalVisible}
        onCancel={() => setIsLogModalVisible(false)}
        footer={null}
        width={800}
        style={{ maxHeight: '80vh', overflowY: 'auto' }} // 限制弹出框高度并启用滚动
      >
        <List
          bordered
          dataSource={logs}
          renderItem={(log) => <List.Item>{log}</List.Item>}
          style={{ maxHeight: '60vh', overflowY: 'auto' }} // 限制日志列表高度并启用滚动
        />
      </Modal>
    </div>
  );
};

export default App;