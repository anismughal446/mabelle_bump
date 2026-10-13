"use client";

import { useApp } from "@/components/AppProvider";
import ProductManager from "@/components/ProductManager";
import { Spinner } from "@/components/Skeleton";

export default function VendorProducts() {
  const { user } = useApp();
  if (!user) return <Spinner />;
  return <ProductManager scope="vendor" vendorId={user.id} />;
}
