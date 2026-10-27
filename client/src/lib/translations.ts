export type Lang = "en" | "ar";

export interface ServiceItem {
  title: string;
  summary: string;
  points: string[];
}

export interface ProjectItem {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface SiteContent {
  nav: {
    services: string;
    projects: string;
    process: string;
    contact: string;
    quote: string;
  };
  hero: {
    /** Sits above the headline, naming the parent group. */
    eyebrow: string;
    headlinePrefix: string;
    headlineAccent: string;
    headlineSuffix: string;
    subheading: string;
    ctaPrimary: string;
    ctaSecondary: string;
    /** Accessible name for the laptop lid toggle, in each state. */
    laptopOpenLabel: string;
    laptopCloseLabel: string;
  };
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    items: ServiceItem[];
  };
  projects: {
    eyebrow: string;
    title: string;
    intro: string;
    items: ProjectItem[];
  };
  process: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: ProcessStep[];
  };
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
    form: {
      name: string;
      namePlaceholder: string;
      contact: string;
      contactPlaceholder: string;
      service: string;
      servicePlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
    };
    info: {
      title: string;
      email: string;
      phone: string;
      location: string;
      locationValue: string;
    };
  };
  footer: {
    tagline: string;
    servicesHeading: string;
    companyHeading: string;
    contactHeading: string;
    vision: string;
    rights: string;
  };
}

export const content: Record<Lang, SiteContent> = {
  en: {
    nav: {
      services: "Services",
      projects: "Projects",
      process: "Process",
      contact: "Contact",
      quote: "Get project quote",
    },
    hero: {
      eyebrow: "The technology arm of Mind Destiny Holding",
      headlinePrefix: "Where idea meets ",
      headlineAccent: "technology",
      headlineSuffix: ".",
      subheading:
        "Digital solutions, smart systems, and operational platforms — plus the networking, servers, and cabling that power them. All under one roof, across the Kingdom.",
      ctaPrimary: "Start a project",
      ctaSecondary: "Explore services",
      laptopOpenLabel: "Open the laptop lid",
      laptopCloseLabel: "Close the laptop lid",
    },
    services: {
      eyebrow: "What we do",
      title: "Integrated corporate services",
      intro:
        "Four capability tracks, one accountable partner — engineered for the scale and compliance needs of Saudi enterprise.",
      items: [
        {
          title: "Software & Web Engineering",
          summary:
            "Custom web platforms, mobile apps, and cloud-native systems built for scale.",
          points: [
            "Custom web & mobile app development",
            "Cloud architecture & CI/CD pipelines",
            "API integration & modernization",
            "Ongoing product engineering",
          ],
        },
        {
          title: "Network & Server Infrastructure",
          summary:
            "Enterprise-grade networking and server environments engineered for uptime.",
          points: [
            "Enterprise networking design & rollout",
            "Server provisioning & virtualization",
            "Structured cabling & data centers",
            "Performance monitoring & maintenance",
          ],
        },
        {
          title: "Security & Smart Access",
          summary:
            "CCTV, access control, and smart-building systems that protect people and assets.",
          points: [
            "CCTV & video surveillance",
            "Smart access & biometric control",
            "Perimeter & intrusion security",
            "24/7 monitoring integration",
          ],
        },
        {
          title: "Enterprise Telephony & IT Hardware",
          summary:
            "Unified communications and reliable hardware procurement for growing teams.",
          points: [
            "Enterprise telephony & unified comms",
            "IT hardware sourcing & deployment",
            "Workstation & data-center equipment",
            "Lifecycle support & maintenance",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "Selected work",
      title: "Featured projects",
      intro:
        "A sample of the platforms and infrastructure programs we've delivered across the Kingdom.",
      items: [
        {
          name: "Riyadh Smart City Portal",
          category: "Government · Smart City",
          description:
            "A unified digital services portal connecting municipal departments and citizens across the capital.",
          tags: ["Next.js", "Node.js", "AWS", "Microservices"],
        },
        {
          name: "National Bank Data Center",
          category: "Banking · Data Center",
          description:
            "A tier-III data center build-out with redundant power, cooling, and core network fabric.",
          tags: ["Data Center", "Redundancy", "Virtualization", "Monitoring"],
        },
        {
          name: "Smart Retail Network",
          category: "Retail · Networking & Security",
          description:
            "Unified networking, CCTV, and smart access rolled out across a nationwide store footprint.",
          tags: ["SD-WAN", "CCTV", "Smart Access", "Multi-site"],
        },
        {
          name: "Government Cloud Migration",
          category: "Government · Cloud",
          description:
            "A phased migration of legacy ministry workloads to a compliant, audited cloud platform.",
          tags: ["Cloud Migration", "Kubernetes", "CI/CD", "Compliance"],
        },
      ],
    },
    process: {
      eyebrow: "How we work",
      title: "From idea to result",
      intro:
        "A disciplined delivery pipeline that keeps every engagement transparent, on schedule, and accountable.",
      steps: [
        {
          title: "Discovery & consultation",
          description:
            "We study your operations, compliance needs, and goals before proposing a single solution.",
        },
        {
          title: "Architecture & design",
          description:
            "Technical architecture and infrastructure plans engineered for scale and security.",
        },
        {
          title: "Development & integration",
          description:
            "Agile engineering sprints with continuous integration into your existing systems.",
        },
        {
          title: "Deployment & testing",
          description:
            "Rigorous testing and staged rollout across sites and environments.",
        },
        {
          title: "Ongoing support & SLA",
          description:
            "24/7 monitoring, maintenance, and guaranteed service-level response.",
        },
      ],
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Start a project",
      intro:
        "Tell us about your goals and our team will respond within one business day.",
      form: {
        name: "Full name",
        namePlaceholder: "Your name",
        contact: "Email or WhatsApp",
        contactPlaceholder: "you@company.com",
        service: "Service needed",
        servicePlaceholder: "Select a service",
        message: "Project details",
        messagePlaceholder: "Tell us about your project and timeline",
        submit: "Send request",
        sending: "Sending…",
        success:
          "Thank you — our team will be in touch within one business day.",
        error:
          "Something went wrong. Please try again or contact us directly.",
      },
      info: {
        title: "Direct contact",
        email: "info@thinksync.sa",
        phone: "+966 11 000 0000",
        location: "Headquarters",
        locationValue: "Riyadh, Saudi Arabia",
      },
    },
    footer: {
      tagline:
        "Integrated IT & infrastructure engineering for Saudi enterprise.",
      servicesHeading: "Services",
      companyHeading: "Company",
      contactHeading: "Contact",
      vision: "Aligned with Saudi Vision 2030",
      rights: "All rights reserved.",
    },
  },
  ar: {
    nav: {
      services: "الخدمات",
      projects: "المشاريع",
      process: "منهجية العمل",
      contact: "تواصل معنا",
      quote: "احصل على عرض سعر",
    },
    hero: {
      eyebrow: "الذراع التقنية لشركة مايند ديستني القابضة",
      headlinePrefix: "حيث تلتقي الفكرة ",
      headlineAccent: "بالتقنية",
      /* No full stop, unlike the English. A trailing Latin period after Arabic
         is placed at the logical end of the run, which in RTL is the far LEFT
         of the line — it reads as a stray mark floating away from the words. */
      headlineSuffix: "",
      subheading:
        "حلول رقمية وأنظمة ذكية ومنصات تشغيلية، إلى جانب الشبكات والخوادم والتمديدات التي تشغّلها. كل ذلك تحت سقف واحد، في أنحاء المملكة.",
      ctaPrimary: "ابدأ مشروعك",
      ctaSecondary: "استكشف الخدمات",
      laptopOpenLabel: "افتح غطاء الحاسوب",
      laptopCloseLabel: "أغلق غطاء الحاسوب",
    },
    services: {
      eyebrow: "ما نقدمه",
      title: "خدمات مؤسسية متكاملة",
      intro:
        "أربعة محاور تخصصية وشريك واحد مسؤول — مصمّمة لتلبية متطلبات الحجم والامتثال للمؤسسات السعودية.",
      items: [
        {
          title: "هندسة البرمجيات والويب",
          summary:
            "منصات ويب مخصصة وتطبيقات جوّال وأنظمة سحابية مبنية للنمو.",
          points: [
            "تطوير تطبيقات الويب والجوال المخصصة",
            "بنية سحابية وخطوط CI/CD",
            "تكامل وتحديث واجهات البرمجة (API)",
            "هندسة منتجات مستمرة",
          ],
        },
        {
          title: "الشبكات والبنية التحتية للخوادم",
          summary:
            "بيئات شبكات وخوادم بمستوى المؤسسات مصممة لضمان الاستمرارية.",
          points: [
            "تصميم وتنفيذ الشبكات المؤسسية",
            "توفير الخوادم والمحاكاة الافتراضية",
            "الكابلات المهيكلة ومراكز البيانات",
            "المراقبة والصيانة المستمرة للأداء",
          ],
        },
        {
          title: "الأمن والتحكم الذكي بالدخول",
          summary:
            "أنظمة مراقبة وتحكم بالدخول ومباني ذكية لحماية الأفراد والأصول.",
          points: [
            "أنظمة المراقبة بالفيديو (CCTV)",
            "التحكم الذكي والبصمة الحيوية بالدخول",
            "أمن المحيط والحماية من التسلل",
            "تكامل المراقبة على مدار الساعة",
          ],
        },
        {
          title: "الاتصالات المؤسسية وتجهيزات تقنية المعلومات",
          summary:
            "أنظمة اتصالات موحدة وتوريد أجهزة موثوقة للفرق المتنامية.",
          points: [
            "أنظمة الاتصالات المؤسسية الموحدة",
            "توريد وتركيب أجهزة تقنية المعلومات",
            "تجهيزات محطات العمل ومراكز البيانات",
            "دعم وصيانة دورة حياة الأجهزة",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "أعمال مختارة",
      title: "مشاريع مختارة",
      intro:
        "نماذج من المنصات وبرامج البنية التحتية التي نفّذناها في مختلف أنحاء المملكة.",
      items: [
        {
          name: "بوابة الرياض الذكية",
          category: "حكومي · مدينة ذكية",
          description:
            "بوابة رقمية موحدة تربط الجهات البلدية بالمواطنين في جميع أنحاء العاصمة.",
          tags: ["Next.js", "Node.js", "AWS", "Microservices"],
        },
        {
          name: "مركز بيانات البنك الوطني",
          category: "قطاع مصرفي · مركز بيانات",
          description:
            "إنشاء مركز بيانات من الفئة الثالثة بأنظمة طاقة وتبريد وشبكة أساسية مزدوجة.",
          tags: ["Data Center", "Redundancy", "Virtualization", "Monitoring"],
        },
        {
          name: "شبكة التجزئة الذكية",
          category: "تجزئة · شبكات وأمن",
          description:
            "شبكات موحدة وأنظمة مراقبة ودخول ذكي عبر فروع منتشرة في أنحاء المملكة.",
          tags: ["SD-WAN", "CCTV", "Smart Access", "Multi-site"],
        },
        {
          name: "ترحيل الجهات الحكومية إلى السحابة",
          category: "حكومي · سحابة",
          description:
            "ترحيل مرحلي لأنظمة وزارية قديمة إلى منصة سحابية متوافقة ومدققة.",
          tags: ["Cloud Migration", "Kubernetes", "CI/CD", "Compliance"],
        },
      ],
    },
    process: {
      eyebrow: "كيف نعمل",
      title: "من الفكرة إلى النتيجة",
      intro:
        "منهجية تنفيذ منضبطة تحافظ على الشفافية والالتزام بالجدول الزمني والمسؤولية في كل مشروع.",
      steps: [
        {
          title: "الاكتشاف والاستشارة",
          description:
            "ندرس عملياتكم ومتطلبات الامتثال وأهدافكم قبل اقتراح أي حل.",
        },
        {
          title: "التصميم المعماري",
          description: "خطط تقنية وبنية تحتية مصممة لتحقيق النمو والأمان.",
        },
        {
          title: "التطوير والتكامل",
          description:
            "دورات تطوير مرنة مع تكامل مستمر مع أنظمتكم الحالية.",
        },
        {
          title: "النشر والاختبار",
          description: "اختبار دقيق ونشر تدريجي عبر المواقع والبيئات.",
        },
        {
          title: "الدعم المستمر واتفاقية مستوى الخدمة",
          description:
            "مراقبة وصيانة على مدار الساعة مع استجابة مضمونة وفق اتفاقية مستوى الخدمة.",
        },
      ],
    },
    contact: {
      eyebrow: "تواصل معنا",
      title: "ابدأ مشروعك",
      intro: "أخبرنا عن أهدافك وسيتواصل معك فريقنا خلال يوم عمل واحد.",
      form: {
        name: "الاسم الكامل",
        namePlaceholder: "اسمك",
        contact: "البريد الإلكتروني أو واتساب",
        contactPlaceholder: "you@company.com",
        service: "الخدمة المطلوبة",
        servicePlaceholder: "اختر الخدمة",
        message: "تفاصيل المشروع",
        messagePlaceholder: "أخبرنا عن مشروعك والجدول الزمني",
        submit: "إرسال الطلب",
        sending: "جارٍ الإرسال…",
        success: "شكرًا لك — سيتواصل معك فريقنا خلال يوم عمل واحد.",
        error: "حدث خطأ ما. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
      },
      info: {
        title: "التواصل المباشر",
        email: "info@thinksync.sa",
        phone: "+966 11 000 0000",
        location: "المقر الرئيسي",
        locationValue: "الرياض، المملكة العربية السعودية",
      },
    },
    footer: {
      tagline: "هندسة تقنية معلومات وبنية تحتية متكاملة للمؤسسات السعودية.",
      servicesHeading: "الخدمات",
      companyHeading: "الشركة",
      contactHeading: "تواصل",
      vision: "بما يتماشى مع رؤية السعودية 2030",
      rights: "جميع الحقوق محفوظة.",
    },
  },
};