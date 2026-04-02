import { faqItems, guideSections } from '../content/editorial'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/card'

export default function EditorialContent() {
  return (
    <section className="max-w-4xl mx-auto w-full px-5 pb-10" aria-label="Contenido editorial sobre NAG-200">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Referencia profesional
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Guía completa: Cálculo de instalaciones de gas según NAG-200
            </h2>
            <p className="text-sm leading-6 text-gray-600">
              Resumen técnico para acompañar el uso de la calculadora y revisar los criterios más
              importantes de dimensionado, ventilación, materiales y presentación ante la
              prestadora.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {guideSections.map(section => (
              <article key={section.title} className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{section.title}</h3>
                <div className="mt-3 space-y-3 text-sm leading-6 text-gray-700">
                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {section.formula && (
                  <div className="mt-4 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-50">
                    <code>{section.formula}</code>
                  </div>
                )}

                {section.variables && (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {section.variables.map(variable => (
                      <div key={variable.label} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <dt className="text-sm font-semibold text-gray-900">{variable.label}</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">{variable.description}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.bullets && (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
                    {section.bullets.map(item => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Preguntas frecuentes
            </h2>
            <p className="text-sm leading-6 text-gray-600">
              Respuestas breves para dudas habituales en cálculo, materiales, ventilación y
              documentación de obra.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqItems.map(item => (
              <details
                key={item.question}
                className="group rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-slate-50/80 hover:shadow-md open:border-blue-300 open:bg-blue-50/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 pr-1 text-sm font-semibold text-slate-900 marker:hidden">
                  <span>{item.question}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100 group-open:bg-blue-600 group-open:text-white">
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <div className="mt-4 space-y-3 border-t border-blue-100 pt-4 text-sm leading-7 text-slate-700">
                      {item.answer.map(paragraph => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
