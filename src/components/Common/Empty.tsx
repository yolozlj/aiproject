import { Empty as AntEmpty } from 'antd';

interface EmptyProps {
  description?: string;
}

export const Empty: React.FC<EmptyProps> = ({ description = '暂无数据' }) => {
  return <AntEmpty description={description} />;
};
