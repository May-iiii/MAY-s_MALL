export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/60 bg-stone-100/50">
      <div className="page-container py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl text-stone-700">
              MAY{"'"}s Mall
            </p>
            <p className="mt-1 text-xs text-stone-500">您的精品购物平台</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-sm font-medium text-text-primary">购物指南</p>
              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                <li>购物流程</li>
                <li>支付方式</li>
                <li>配送说明</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">服务保障</p>
              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                <li>退换货政策</li>
                <li>售后服务</li>
                <li>联系客服</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} MAY{"'"}s Mall. 仅供演示用途。
        </p>
      </div>
    </footer>
  );
}
