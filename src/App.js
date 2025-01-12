import React, { useState } from 'react';
import { Upload, Button, message, Row, Col, Card } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';

const { Dragger } = Upload;

const App = () => {
  const [fileList1, setFileList1] = useState([]);
  const [fileList2, setFileList2] = useState([]);
  const [resultFile, setResultFile] = useState(null);

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
    }
  };

  // 下载结果文件
  const handleDownload = () => {
    if (resultFile) {
      window.location.href = `/download?filePath=${resultFile}`;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="上传文件 1" bordered={false}>
            <div {...getRootProps1()} style={{ border: '2px dashed #1890ff', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
              <input {...getInputProps1()} />
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Upload fileList={fileList1} onChange={handleUpload1} beforeUpload={() => false}>
                <Button icon={<InboxOutlined />}>选择文件</Button>
              </Upload>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="上传文件 2" bordered={false}>
            <div {...getRootProps2()} style={{ border: '2px dashed #1890ff', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
              <input {...getInputProps2()} />
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Upload fileList={fileList2} onChange={handleUpload2} beforeUpload={() => false}>
                <Button icon={<InboxOutlined />}>选择文件</Button>
              </Upload>
            </div>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: '24px' }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={handleProcess} size="large">
            处理文件
          </Button>
        </Col>
      </Row>
      {resultFile && (
        <Row style={{ marginTop: '24px' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} size="large">
              下载结果
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default App;