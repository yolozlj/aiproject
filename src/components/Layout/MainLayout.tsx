import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import SideNav from './SideNav';
import './MainLayout.css';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  return (
    <Layout className="main-layout">
      <TopNav />
      <Layout>
        <SideNav />
        <Layout className="content-layout">
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
