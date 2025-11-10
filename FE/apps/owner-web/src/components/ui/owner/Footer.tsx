import { useNavigate, useLocation } from "react-router-dom";
import { Home, Clock, Ticket, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterItem {
  icon: typeof Home;
  label: string;
  path: string;
  activePaths: string[]; // 활성화되어야 할 경로들
}

const footerItems: FooterItem[] = [
  {
    icon: Home,
    label: "주문리스트",
    path: "/owner/orders/list",
    activePaths: ["/owner/orders/list", "/owner/orders/qr-scan", "/owner/orders/receipt-confirm"],
  },
  {
    icon: Clock,
    label: "마감세일",
    path: "/owner/catalog/closeout-sale",
    activePaths: ["/owner/catalog/closeout-sale"],
  },
  {
    icon: Ticket,
    label: "푸켓팅",
    path: "/owner/catalog/foocketing",
    activePaths: ["/owner/catalog/foocketing"],
  },
  {
    icon: FileText,
    label: "주간레포트",
    path: "/owner/insights/report",
    activePaths: ["/owner/insights/report"],
  },
  {
    icon: Settings,
    label: "가게관리",
    path: "/owner/settings",
    activePaths: ["/owner/settings", "/owner/catalog/menu"],
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (activePaths: string[]) => {
    return activePaths.some((path) => location.pathname === path);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full bg-bg-0">
      <div className="w-full flex items-center justify-around py-6 px-4">
        {footerItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.activePaths);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1"
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-200",
                  active ? "text-brand" : "text-stroke-1"
                )}
              />
              <span
                className={cn(
                    "caption2 transition-colors duration-200",
                    active ? "text-brand " : "text-stroke-1",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
