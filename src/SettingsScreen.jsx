import { useState } from "react";
import PhoneFrame from "./components/PhoneFrame";
import StatusBar from "./components/StatusBar";
import TabBar from "./components/TabBar";
import Toggle from "./components/Toggle";
import SettingsRow from "./components/SettingsRow";
import avatar from "./assets/shared/avatar.svg";
import chevron from "./assets/shared/chevron.svg";
import { NOTIFICATION_TOGGLES, SECURITY_TOGGLES } from "./data/settings";

function SectionHeader({ children }) {
  return (
    <p className="w-full text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
      {children}
    </p>
  );
}

function useToggleGroup(items) {
  const [state, setState] = useState(() => Object.fromEntries(items.map((item) => [item.key, item.defaultEnabled])));
  const toggle = (key) => setState((prev) => ({ ...prev, [key]: !prev[key] }));
  return [state, toggle];
}

export default function SettingsScreen() {
  const [notifState, toggleNotif] = useToggleGroup(NOTIFICATION_TOGGLES);
  const [securityState, toggleSecurity] = useToggleGroup(SECURITY_TOGGLES);

  return (
    <PhoneFrame>
      <div className="absolute top-0 left-0 w-full">
        <StatusBar />
      </div>

      <div className="absolute top-[59px] left-0 flex w-full flex-col items-center gap-4 px-6">
        <p className="text-center text-2xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
          設定
        </p>

        {/* Profile Update */}
        <div className="flex w-full flex-col items-start gap-3">
          <SectionHeader>個人資料</SectionHeader>
          <SettingsRow
            onClick={(e) => e.preventDefault()}
            label="Jessie"
            description="jessie66022@gmail.com"
            right={
              <div className="flex shrink-0 items-center gap-3">
                <img src={avatar} alt="頭像" className="size-10" />
                <img src={chevron} alt="" className="size-6 shrink-0" />
              </div>
            }
          />
        </div>

        {/* Notification Toggles */}
        <div className="flex w-full flex-col items-start gap-3">
          <SectionHeader>通知設定</SectionHeader>
          <div className="flex w-full flex-col items-start gap-2">
            {NOTIFICATION_TOGGLES.map((item) => (
              <SettingsRow
                key={item.key}
                label={item.label}
                description={item.description}
                right={<Toggle checked={notifState[item.key]} onChange={() => toggleNotif(item.key)} label={item.label} />}
              />
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="flex w-full flex-col items-start gap-3 pb-4">
          <SectionHeader>安全性</SectionHeader>
          <div className="flex w-full flex-col items-start gap-2">
            {SECURITY_TOGGLES.map((item) => (
              <SettingsRow
                key={item.key}
                label={item.label}
                description={item.description}
                right={<Toggle checked={securityState[item.key]} onChange={() => toggleSecurity(item.key)} label={item.label} />}
              />
            ))}
            <div
              className="flex w-full flex-col items-start rounded-2xl"
              style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
            >
              <a href="#" onClick={(e) => e.preventDefault()} className="w-full cursor-pointer px-4 py-3 text-base leading-[1.5]" style={{ color: "var(--color-text-primary)" }}>
                變更密碼
              </a>
              <div className="h-px w-full" style={{ background: "var(--color-bg-base)" }} />
              <a href="#" onClick={(e) => e.preventDefault()} className="w-full cursor-pointer px-4 py-3 text-base leading-[1.5]" style={{ color: "var(--color-text-primary)" }}>
                登出
              </a>
            </div>
          </div>
        </div>
      </div>

      <TabBar active="settings" />
    </PhoneFrame>
  );
}
