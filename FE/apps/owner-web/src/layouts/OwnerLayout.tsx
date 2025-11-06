import { Outlet, Link } from 'react-router-dom';
import { IconButton } from '../components/ui/owner/IconButton';
import { Settings, Home, Search, Bell, Heart } from 'lucide-react';
import Header from '../components/ui/owner/Header';
import Footer from '../components/ui/owner/Footer';

export default function OwnerLayout() {
  return (
    <div className="flex min-h-screen">
      <nav style={{ 
        width: '250px', 
        padding: '20px', 
        borderRight: '1px solid #ccc',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '20px' }}>Owner Web App</h1>
        
        {/* IconButton 테스트 섹션 */}
        <div style={{ marginBottom: '30px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>IconButton 테스트</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <IconButton
              icon={Home}
              onClick={() => console.log('Home clicked')}
              aria-label="홈"
            />
            <IconButton
              icon={Search}
              onClick={() => console.log('Search clicked')}
              aria-label="검색"
            />
            <IconButton
              icon={Bell}
              onClick={() => console.log('Bell clicked')}
              aria-label="알림"
            />
            <IconButton
              icon={Heart}
              onClick={() => console.log('Heart clicked')}
              aria-label="좋아요"
            />
            <IconButton
              icon={Settings}
              onClick={() => console.log('Settings clicked')}
              aria-label="설정"
            />
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
            호버/클릭 시 색상 변경 확인
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>인증</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/login" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                로그인
              </Link>
              <Link to="/owner/signup" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                회원가입
              </Link>
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>주문 관리</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/orders/list" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                주문 목록
              </Link>
              <Link to="/owner/orders/qr-scan" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                QR 스캔
              </Link>
              <Link to="/owner/orders/receipt-confirm" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                영수증 확인
              </Link>
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>카탈로그 관리</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/catalog/menu" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                메뉴 관리
              </Link>
              <Link to="/owner/catalog/foocketing" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                푸켓팅 관리
              </Link>
              <Link to="/owner/catalog/closeout-sale" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                마감 세일 관리
              </Link>
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>인사이트</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/insights/report" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                리포트
              </Link>
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>설정</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/settings" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                설정
              </Link>
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>테스트</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/owner/test" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', backgroundColor: '#fff', display: 'block' }}>
                컴포넌트 테스트
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 pb-20 px-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
