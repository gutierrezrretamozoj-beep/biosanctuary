import React from "react";
import { ShieldAlert } from "lucide-react";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/labels";

export function ForbiddenNotice({
  requiredRoles = [],
  actionName = "esta acción",
}: {
  requiredRoles?: UserRole[];
  actionName?: string;
}) {
  const roleNames = requiredRoles.map((r) => ROLE_LABELS[r] || r).join(" o ");

  return (
    <div
      role="alert"
      className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl text-red-950 dark:text-red-100 flex items-center gap-3.5 my-3 shadow-md shadow-red-500/5"
    >
      <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-sm tracking-tight mb-0.5">
          Permiso restringido (Control de Acceso RBAC)
        </p>
        <p className="text-xs text-red-900/80 dark:text-red-200/80 leading-relaxed">
          Para realizar {actionName} se requiere el rol de{" "}
          <strong className="font-semibold text-red-700 dark:text-red-300">
            {roleNames || "administración autorizada"}
          </strong>
          . Tu usuario actual no tiene asignados estos privilegios.
        </p>
      </div>
    </div>
  );
}

export default ForbiddenNotice;
