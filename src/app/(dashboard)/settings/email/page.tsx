import { DomainConfig } from "@/components/settings/domain-config";
import { SenderConfig } from "@/components/settings/sender-config";

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Email</h1>
        <p className="text-sm text-gray-500 mt-1">Configure o envio de emails</p>
      </div>
      <DomainConfig />
      <SenderConfig />
    </div>
  );
}
