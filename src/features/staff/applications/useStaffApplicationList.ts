"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { StaffApplicationListItem } from "@/lib/staff/types";
import { staffRequest } from "@/lib/staff/client";

const FIRST_SORT: Record<string, string> = {
  created_at: "-created_at",
  student_name: "student_name",
  applying_class: "applying_class",
  payment_amount: "-payment_amount",
  status: "status",
};

export function useStaffApplicationList() {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [applyingClass, setApplyingClass] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("-created_at");
  const [classes, setClasses] = useState<string[]>([]);
  const [rows, setRows] = useState<StaffApplicationListItem[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  const filters = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (applyingClass) params.set("applying_class", applyingClass);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (sort) params.set("sort", sort);
    return params.toString();
  }, [q, status, applyingClass, dateFrom, dateTo, sort]);

  // Any filter change invalidates the current page.
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const query = useMemo(() => {
    const params = new URLSearchParams(filters);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    return `?${params.toString()}`;
  }, [filters, page]);

  useEffect(() => {
    setLoading(true);
    staffRequest<{
      count: number;
      results: StaffApplicationListItem[];
      classes: string[];
    }>(`/api/admissions/staff/applications/${query}`)
      .then((data) => {
        setRows(data.results);
        setCount(data.count);
        setClasses(data.classes);
        setLoadError(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "unauthorized") {
          router.replace("/login");
          return;
        }
        setRows([]);
        setCount(0);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [query, router, reloadTick]);

  function onSort(field: string) {
    if (sort === field || sort === `-${field}`) {
      setSort(sort.startsWith("-") ? field : `-${field}`);
      return;
    }
    setSort(FIRST_SORT[field] ?? field);
  }

  return {
    t,
    ta,
    locale,
    router,
    q,
    setQ,
    status,
    setStatus,
    applyingClass,
    setApplyingClass,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sort,
    setSort,
    classes,
    rows,
    count,
    page,
    setPage,
    loadError,
    loading,
    setReloadTick,
    pageSize,
    pageCount,
    query,
    onSort,
  };
}
