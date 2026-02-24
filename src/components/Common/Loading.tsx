import { Spin } from 'antd';
import './Loading.css';

interface LoadingProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  size = 'default',
  fullscreen = false
}) => {
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <Spin size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin size={size} tip={tip} />
    </div>
  );
};
