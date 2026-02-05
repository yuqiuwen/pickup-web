import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {Button} from '@/components/ui/button'

export function BackToTopBtn() {
  const [visible, setVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    console.log(111)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400); // 阈值：滚动超过 400px 才显示
        ticking = false;
      });
    };

    onScroll(); // 初始化时同步一次，避免刷新后状态不对
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      variant="outline"
      className={[
        "h-10 w-10 rounded-full z-50 bg-background px-4 py-3 shadow-lg hover:shadow-xl transition-shadow",
        "transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
      ].join(" ")}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}