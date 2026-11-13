import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Clock,
  Sparkles,
  Heart,
  Flag,
  Utensils,
  Stethoscope,
  Zap,
} from "lucide-react";
import {
  EnclosureStatus,
  SpecimenStatus,
  UrgencyLevel,
  FeedingDietType,
} from "@/types";
import {
  ENCLOSURE_STATUS_LABELS,
  SPECIMEN_STATUS_LABELS,
  URGENCY_LABELS,
  FEEDING_DIET_LABELS,
} from "@/lib/labels";

export type StatusPillKind =
  | { type: "enclosure"; status: EnclosureStatus }
  | { type: "specimen"; status: SpecimenStatus }
  | { type: "urgency"; status: UrgencyLevel }
  | { type: "diet"; status: FeedingDietType };

export function StatusPill({
  kind,
  className = "",
}: {
  kind: StatusPillKind;
  className?: string;
}) {
  let label = "";
  let icon: React.ReactNode = null;
  let colorClasses = "";

  if (kind.type === "enclosure") {
    label = ENCLOSURE_STATUS_LABELS[kind.status] || kind.status;
    switch (kind.status) {
      case "OPTIMAL":
        icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
        colorClasses = "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30";
        break;
      case "MAINTENANCE_REQUIRED":
        icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
        colorClasses = "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30";
        break;
      case "UNDER_REPAIR":
        icon = <Wrench className="w-3.5 h-3.5 text-orange-500" />;
        colorClasses = "bg-orange-500/15 text-orange-900 dark:text-orange-200 border-orange-500/30";
        break;
      case "QUARANTINE_LOCKED":
        icon = <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
        colorClasses = "bg-red-500/15 text-red-900 dark:text-red-200 border-red-500/30";
        break;
    }
  } else if (kind.type === "specimen") {
    label = SPECIMEN_STATUS_LABELS[kind.status] || kind.status;
    switch (kind.status) {
      case "QUARANTINE":
        icon = <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
        colorClasses = "bg-red-500/15 text-red-900 dark:text-red-200 border-red-500/30";
        break;
      case "REHABILITATION":
        icon = <Heart className="w-3.5 h-3.5 text-amber-500" />;
        colorClasses = "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30";
        break;
      case "PERMANENT_RESIDENT":
        icon = <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
        colorClasses = "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30";
        break;
      case "READY_FOR_RELEASE":
        icon = <Flag className="w-3.5 h-3.5 text-teal-500" />;
        colorClasses = "bg-teal-500/15 text-teal-900 dark:text-teal-200 border-teal-500/30";
        break;
    }
  } else if (kind.type === "urgency") {
    label = URGENCY_LABELS[kind.status] || kind.status;
    switch (kind.status) {
      case "STANDARD":
        icon = <Clock className="w-3.5 h-3.5 text-emerald-500" />;
        colorClasses = "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30";
        break;
      case "HIGH":
        icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
        colorClasses = "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30";
        break;
      case "CRITICAL":
        icon = <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
        colorClasses = "bg-red-500/20 text-red-900 dark:text-red-100 border-red-500/40 font-bold animate-pulse";
        break;
    }
  } else if (kind.type === "diet") {
    label = FEEDING_DIET_LABELS[kind.status] || kind.status;
    switch (kind.status) {
      case "REGULAR_FEEDING":
        icon = <Utensils className="w-3.5 h-3.5 text-emerald-500" />;
        colorClasses = "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30";
        break;
      case "MEDICAL_TREATMENT":
        icon = <Stethoscope className="w-3.5 h-3.5 text-rose-500" />;
        colorClasses = "bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/30 font-semibold";
        break;
      case "EMERGENCY_SUPPLEMENT":
        icon = <Zap className="w-3.5 h-3.5 text-amber-500" />;
        colorClasses = "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30 font-semibold";
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${colorClasses} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}

export default StatusPill;
