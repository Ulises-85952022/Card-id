import { useEffect, useState } from "react";
import { IdCard, ExternalLink, Star } from "lucide-react";
import { PageHeader } from "@panel/components/shared/PageHeader";
import { Badge } from "@panel/components/ui/badge";
import { Button } from "@panel/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@panel/components/ui/card";
import { Skeleton } from "@panel/components/ui/skeleton";
import { getAllCards } from "../../lib/cardsService";
import { getPublicCardUrl } from "../../utils/publicUrl";

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** Tarjetas reales guardadas en Firestore: cada una es un ejemplo de lo que venderemos como tarjeta. */
export default function Cards() {
  const [cards, setCards] = useState(null);

  useEffect(() => {
    let active = true;
    getAllCards().then((list) => {
      if (active) setCards(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tarjetas"
        description="Las tarjetas digitales que ya están publicadas. Cada una tiene su enlace público para compartir."
      />

      {cards === null ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando tarjetas">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-muted-foreground">Todavía no hay tarjetas publicadas.</Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const { profile } = card;
            const publicUrl = getPublicCardUrl(card.slug);
            return (
              <li key={card.id} className="min-w-0">
                <Card className="flex h-full flex-col">
                  <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-border">
                      <IdCard className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="truncate">{profile.name}</CardTitle>
                        {card.isPrimaryAdmin && (
                          <Badge>
                            <Star /> Principal
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1 truncate">
                        {profile.title}
                        {profile.company ? ` · ${profile.company}` : ""}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-caption text-muted-foreground">/{card.slug}</p>
                      <p className="text-caption text-muted-foreground">Actualizada {formatDate(card.updatedAt)}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        Ver tarjeta <ExternalLink />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
