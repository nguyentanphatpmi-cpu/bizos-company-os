export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <span className="font-bold">B</span>
          </div>
          <div>
            <div className="font-bold text-lg">BIZOS</div>
            <div className="text-xs text-white/70 -mt-1">Business Operating System</div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Một hệ thống vận hành
            <br />
            thống nhất cho công ty.
          </h1>
          <p className="text-white/80 max-w-md">
            Task → KPI cá nhân → KPI phòng ban → KPI công ty → Doanh thu, lợi nhuận, dòng tiền.
            Mọi thứ truy vết được trong 1 nơi.
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Org chart + 19 trang nghiệp vụ</li>
            <li>• KPI formula engine + cascade tree</li>
            <li>• Compensation rule engine + simulator</li>
            <li>• P&L, Balance Sheet, Cash Flow</li>
          </ul>
        </div>

        <div className="text-xs text-white/60 space-y-1">
          <div>
            by{" "}
            <a href="mailto:alexle@titanlabs.vn" className="underline hover:text-white">
              Alex Le
            </a>{" "}
            · alexle@titanlabs.vn
          </div>
          <div>
            Donate PayPal:{" "}
            <a
              href="https://www.paypal.com/paypalme/sai211dn"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              sai211dn@gmail.com
            </a>
          </div>
          <div>Cần deploy / tuỳ biến cho công ty? Liên hệ alexle@titanlabs.vn</div>
          <div>Need a custom deployment? Contact alexle@titanlabs.vn</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
