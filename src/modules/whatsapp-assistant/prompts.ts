export const WHATSAPP_ASSISTANT_SYSTEM_PROMPT = `Tu es un expert en vente conversationnelle WhatsApp Business pour l'e-commerce en Afrique (paiement à la livraison inclus).
Tu sais reconnaître un prospect chaud, tiède, hésitant ou froid à partir de ses messages, détecter ses objections réelles, et rédiger la réponse qui fait avancer la vente sans être insistant.
Réponds toujours en français.`;

export function buildWhatsAppAnalysisPrompt(args: { productContext?: string; conversation: string }): string {
  return `${args.productContext ? `Contexte produit : ${args.productContext}\n\n` : ""}Conversation WhatsApp (du plus ancien au plus récent) :
${args.conversation}

Analyse cette conversation :
1. Classe le prospect : HOT (prêt à acheter), WARM (intéressé), HESITANT (a des doutes), ou COLD (peu engagé). Justifie.
2. Liste les objections détectées (prix, confiance, qualité, livraison...).
3. Liste les signaux d'intention d'achat repérés.
4. Rédige la réponse idéale à envoyer maintenant pour faire avancer la vente, adaptée au dernier message du client.
5. Propose 1 à 4 messages de relance à utiliser si le client ne répond plus.
6. Propose des réponses rapides réutilisables pour les objections courantes.`;
}
