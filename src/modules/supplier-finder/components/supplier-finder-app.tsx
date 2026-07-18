"use client";

import { useState } from "react";
import { Truck, AlertTriangle, Plus, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { SupplierRecommendationResult } from "../schemas";

interface SupplierItem {
  id: string;
  name: string;
  platform: string;
  price: number | null;
  minOrderQty: number | null;
  deliveryDays: number | null;
  rating: number | null;
  url: string | null;
  notes: string | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  ALIEXPRESS: "AliExpress",
  ALIBABA: "Alibaba",
  CJ_DROPSHIPPING: "CJ Dropshipping",
  OTHER: "Autre",
};

export function SupplierFinderApp() {
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  const [supplierName, setSupplierName] = useState("");
  const [platform, setPlatform] = useState("ALIEXPRESS");
  const [price, setPrice] = useState("");
  const [minOrderQty, setMinOrderQty] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [rating, setRating] = useState("");

  const [recommendation, setRecommendation] = useState<SupplierRecommendationResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureProduct(): Promise<string> {
    if (productId) return productId;
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: productName }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Produit invalide");
    setProductId(body.product.id);
    return body.product.id;
  }

  async function handleAddSupplier(event: React.FormEvent) {
    event.preventDefault();
    setIsAdding(true);
    setError(null);
    try {
      const id = await ensureProduct();
      const response = await fetch("/api/supplier-finder/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          name: supplierName,
          platform,
          price: price ? Number(price) : undefined,
          minOrderQty: minOrderQty ? Number(minOrderQty) : undefined,
          deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
          rating: rating ? Number(rating) : undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Impossible d'ajouter le fournisseur");
      setSuppliers((prev) => [body.supplier, ...prev]);
      setSupplierName("");
      setPrice("");
      setMinOrderQty("");
      setDeliveryDays("");
      setRating("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCompare() {
    if (!productId) return;
    setIsComparing(true);
    setError(null);
    try {
      const response = await fetch("/api/supplier-finder/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Comparaison impossible");
      setRecommendation(body.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Supplier Finder</h1>
        <p className="text-sm text-muted-foreground">
          Ajoutez vos fournisseurs candidats et laissez l&apos;IA recommander le meilleur choix.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-product">Produit</Label>
            <Input
              id="sf-product"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={Boolean(productId)}
            />
          </div>

          <form onSubmit={handleAddSupplier} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input placeholder="Nom du fournisseur" required value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input placeholder="Prix" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input
              placeholder="Quantité minimum"
              type="number"
              min={1}
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(e.target.value)}
            />
            <Input
              placeholder="Délai de livraison (jours)"
              type="number"
              min={0}
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
            <Input
              placeholder="Note /5"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <Button type="submit" isLoading={isAdding} className="sm:col-span-3 w-fit">
              <Plus className="h-4 w-4" /> Ajouter le fournisseur
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {suppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="Aucun fournisseur ajouté"
          description="Ajoutez au moins deux fournisseurs candidats pour pouvoir les comparer."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suppliers.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge variant="outline" className="mt-1">
                      {PLATFORM_LABELS[s.platform] ?? s.platform}
                    </Badge>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {s.price !== null && <span>Prix : {s.price}</span>}
                      {s.minOrderQty !== null && <span>MOQ : {s.minOrderQty}</span>}
                      {s.deliveryDays !== null && <span>{s.deliveryDays}j livraison</span>}
                    </div>
                  </div>
                  {s.rating !== null && (
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {s.rating}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleCompare} isLoading={isComparing} disabled={suppliers.length < 2} className="w-fit">
            <Sparkles className="h-4 w-4" /> Comparer et recommander
          </Button>
        </div>
      )}

      {recommendation && (
        <Card className="animate-fade-in border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-2 p-5">
            <p className="text-sm font-semibold text-primary">
              Recommandation : {recommendation.recommendedSupplierName}
            </p>
            <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
            {recommendation.riskWarnings.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Points de vigilance</p>
                <ul className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                  {recommendation.riskWarnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
