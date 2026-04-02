export interface GuideSection {
  title: string
  paragraphs: string[]
  formula?: string
  variables?: Array<{ label: string; description: string }>
  bullets?: string[]
}

export interface FaqItem {
  question: string
  answer: string[]
}

export const guideSections: GuideSection[] = [
  {
    title: 'Introducción: NAG-200 y ENARGAS',
    paragraphs: [
      'La norma NAG-200 es el reglamento técnico oficial para instalaciones internas domiciliarias de gas en Argentina, emitido por ENARGAS (Ente Nacional Regulador del Gas). Todo instalador de gas matriculado debe conocer y aplicar esta norma para garantizar instalaciones seguras y eficientes que reciban la aprobación de las prestadoras de servicio como Metrogas, Camuzzi, Naturgy, Litoral Gas o Gasnor.',
    ],
  },
  {
    title: 'Fórmula de Renouard para caída de presión',
    paragraphs: [
      'La fórmula de Renouard es el método estándar para calcular la caída de presión en tuberías de gas en baja presión (hasta 100 mbar). Esta fórmula establece la relación entre el diámetro de la cañería, la longitud equivalente, el caudal de gas, la densidad relativa y la caída de presión permitida:',
      'La norma NAG-200 establece un máximo de 1 mbar de caída de presión desde el medidor hasta el artefacto más desfavorable. Ese valor equivale a 10 mm de columna de agua.',
    ],
    formula: 'd = (23200 x delta x Le x Q^1.82 / DeltaP)^0.2075',
    variables: [
      { label: 'd', description: 'diámetro interior en mm.' },
      { label: 'delta', description: 'densidad relativa del gas: 0.65 para Gas Natural y 1.52 para GLP.' },
      { label: 'Le', description: 'longitud equivalente en metros.' },
      { label: 'Q', description: 'caudal en m3/h.' },
      { label: 'DeltaP', description: 'caída de presión en mbar.' },
    ],
  },
  {
    title: 'Velocidad máxima del gas en cañerías',
    paragraphs: [
      'La NAG-200 establece que la velocidad del gas en tuberías de baja presión no debe superar los 7 m/s. Velocidades mayores generan ruido, mayores pérdidas de carga y posibles vibraciones en la instalación.',
      'La fórmula de control es la siguiente:',
      'Si el cálculo arroja una velocidad superior a 7 m/s, corresponde seleccionar un diámetro mayor.',
    ],
    formula: 'v = 358.36 x Q / d^2',
    variables: [
      { label: 'v', description: 'velocidad en m/s.' },
      { label: 'Q', description: 'caudal en m3/h.' },
      { label: 'd', description: 'diámetro interior en mm.' },
    ],
  },
  {
    title: 'Factor de simultaneidad en consumos',
    paragraphs: [
      'En una instalación domiciliaria, no todos los artefactos funcionan simultáneamente al 100% de su capacidad. La metodología de simultaneidad aplicada en esta herramienta considera un criterio práctico para dimensionar cañerías sin comprometer la seguridad.',
    ],
    bullets: [
      'Los dos artefactos de mayor consumo se consideran al 100%.',
      'El resto de los artefactos se computa al 50%.',
      'Ese factor permite obtener un caudal de cálculo más económico y realista para los tramos comunes.',
    ],
  },
  {
    title: 'Ventilación de ambientes con gas (NAG-200 Cap. 6)',
    paragraphs: [
      'El Capítulo 6 de la NAG-200 regula los requisitos de ventilación para ambientes con artefactos a gas de tiro natural. Todo ambiente debe tener ventilación permanente mediante rejillas: una inferior, a menos de 30 cm del piso, y una superior, a más de 1.80 m, para evacuar gases y permitir ingreso de aire fresco.',
      'El área mínima habitual es de 4 cm2 por kW de potencia o 6 cm2/kW en criterio conservador, con un mínimo de 100 cm2 por rejilla. Los artefactos de tiro balanceado no requieren ventilación de ambiente.',
    ],
    bullets: [
      'Los artefactos de tiro natural requieren conductos de evacuación con diámetros mínimos según su potencia.',
      'En baños y dormitorios deben instalarse equipos de tiro balanceado cuando la reglamentación lo exige; los de tiro natural están prohibidos en esos ambientes por seguridad.',
      'Siempre debe verificarse también lo indicado por el fabricante y por la prestadora.',
    ],
  },
  {
    title: 'Materiales y accesorios para cañerías de gas',
    paragraphs: [
      'Las cañerías de gas deben ser de acero negro o epoxi IRAM 2502, cobre tipo K o L con uniones permitidas, o acero inoxidable según la NAG-250. Está prohibido el uso de PVC u otros materiales plásticos para cañerías internas, y el PEAD se admite únicamente en tramos enterrados.',
      'El cobre no debe quedar en contacto directo con cemento sin protección. Los accesorios deben ser de calidad equivalente a la cañería y siempre deben computarse en la longitud equivalente del tramo.',
    ],
    bullets: [
      'La herramienta usa como base el criterio Le = L x 1.2 y permite sumar accesorios individuales para un enfoque más detallado.',
    ],
  },
  {
    title: 'Prueba de hermeticidad obligatoria',
    paragraphs: [
      'Antes de habilitar una instalación de gas, se debe realizar la prueba de hermeticidad con aire a 150 mbar durante 15 minutos sin pérdida de presión. Esta verificación confirma que no existen fugas en la red interna.',
    ],
    bullets: [
      'Los empalmes deben quedar al descubierto para permitir inspecciones futuras.',
      'La instalación debe incluir una válvula de corte general en un lugar accesible y señalizado.',
    ],
  },
  {
    title: 'Proceso de aprobación por la prestadora',
    paragraphs: [
      'Una vez completada la instalación por un gasista matriculado, debe solicitarse la inspección a la prestadora correspondiente. El instalador presenta el formulario F 3.5 de la NAG-200 junto con el plano de la instalación y el certificado de la prueba de hermeticidad.',
      'El inspector verifica diámetros, ventilación, distancias a fuentes de ignición, tipo de artefactos según el ambiente y accesibilidad de válvulas. Si todo está correcto, la instalación puede aprobarse y quedar habilitada para el suministro de gas.',
    ],
  },
]

export const faqItems: FaqItem[] = [
  {
    question: '¿Qué diferencia hay entre Gas Natural y GLP en los cálculos?',
    answer: [
      'La diferencia principal está en la densidad relativa, el poder calorífico y las condiciones de suministro. Esos datos modifican el caudal requerido y la pérdida de carga, por lo que una misma instalación puede dar diámetros distintos según se calcule para Gas Natural o para GLP.',
      'Por eso conviene definir el tipo de gas desde el inicio y no reutilizar resultados entre ambos sistemas sin recalcular.',
    ],
  },
  {
    question: '¿Puedo usar cañería de cobre para gas?',
    answer: [
      'Depende de la normativa aplicable, del tipo de instalación y de lo que admita la prestadora en tu zona. En muchos casos el acero sigue siendo la solución más aceptada para instalaciones internas tradicionales, mientras que otros materiales solo se permiten en condiciones específicas y con sistema aprobado.',
      'Antes de definir el material conviene verificar la versión vigente de la norma y el criterio de la distribuidora, porque la aprobación final no depende solo del cálculo.',
    ],
  },
  {
    question: '¿Cuál es la presión de trabajo normal del Gas Natural?',
    answer: [
      'En instalaciones domiciliarias de baja presión suele tomarse como referencia de cálculo un suministro del orden de 19 mbar aguas abajo de la regulación. Ese valor puede variar según la prestadora, la regulación disponible y el tipo de servicio.',
      'Lo importante es respetar la presión realmente disponible en el punto de suministro y mantener la caída total dentro de los márgenes admisibles.',
    ],
  },
  {
    question: '¿Por qué la calculadora usa la fórmula Renouard y no otra?',
    answer: [
      'Porque es una formulación de uso extendido para instalaciones de gas de baja presión y resulta adecuada para verificar cañerías internas con criterio práctico y profesional. Relaciona caudal, longitud equivalente, densidad del gas y caída de presión de forma directa.',
      'Eso la vuelve consistente con el tipo de problema que resuelve la calculadora: dimensionado preliminar y verificación hidráulica de instalaciones según práctica habitual NAG-200.',
    ],
  },
  {
    question: '¿Qué pasa si la caída de presión supera 1 mbar?',
    answer: [
      'Si la pérdida supera ese valor de referencia, el tramo debe revisarse. Normalmente la corrección pasa por aumentar diámetro, reducir longitud equivalente, simplificar accesorios o replantear el recorrido.',
      'Si no se corrige, puede faltar presión en los artefactos más alejados y la instalación puede quedar fuera del criterio técnico esperado para su aprobación.',
    ],
  },
  {
    question: '¿Puedo instalar un calefón en el baño?',
    answer: [
      'Como criterio general, no debe instalarse un calefón de cámara abierta o tiro natural en un baño. Ese tipo de ubicación exige máxima cautela por riesgo de combustión deficiente y acumulación de productos de combustión.',
      'Solo corresponde evaluar soluciones específicamente permitidas por la normativa, por el fabricante y por la prestadora, como equipos estancos o de tiro balanceado cuando la reglamentación local lo admita.',
    ],
  },
  {
    question: '¿Qué es el formulario F 3.5 y para qué sirve?',
    answer: [
      'El F 3.5 es uno de los formularios técnicos utilizados en trámites de presentación de instalaciones de gas ante la prestadora. Suele acompañar la documentación del matriculado y deja constancia de datos de obra, cálculo, artefactos y responsabilidad profesional.',
      'El nombre exacto, el circuito y la documentación complementaria pueden variar según la distribuidora, por lo que siempre conviene revisar el instructivo vigente de la empresa interviniente.',
    ],
  },
]
