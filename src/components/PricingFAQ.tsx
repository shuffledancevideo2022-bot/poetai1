import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Что такое кредит?",
    a: "1 кредит = 1 генерация стиха или песни. После покупки пакета кредиты зачисляются на ваш аккаунт и не сгорают.",
  },
  {
    q: "Чем подписка отличается от пакета?",
    a: "Подписка даёт безлимитные генерации на весь период. Пакет — это фиксированное количество кредитов без ограничения по времени использования.",
  },
  {
    q: "Как происходит оплата?",
    a: "Оплата проводится через Lava.top — безопасный платёжный сервис. Принимаются банковские карты, электронные кошельки и другие способы оплаты.",
  },
  {
    q: "Можно ли вернуть деньги?",
    a: "Если вы не использовали кредиты, мы можем рассмотреть возврат. Напишите нам на почту, и мы решим вопрос.",
  },
  {
    q: "Есть ли бесплатные генерации?",
    a: "Да! При регистрации вы получаете 5 бесплатных кредитов. Этого достаточно, чтобы попробовать сервис и оценить качество генерации.",
  },
  {
    q: "Могу ли я использовать созданные тексты коммерчески?",
    a: "Да, все сгенерированные тексты принадлежат вам. Вы можете использовать их в личных и коммерческих целях без ограничений.",
  },
];

export function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">❓ Частые вопросы</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
