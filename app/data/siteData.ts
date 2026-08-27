export interface HeroSlide {
  id?: number;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  buttonText?: string;
}

export interface ServiceItem {
  id?: number;
  slug: string;
  name: string;
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  image: string;
}

export interface ProjectItem {
  id?: number;
  title: string;
  client: string;
  description: string;
  image: string;
  category?: string;
  year?: string;
}

export interface TeamMemberItem {
  id?: number;
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface PartnerItem {
  id?: number;
  name: string;
  logo: string;
  website?: string;
}

export interface BlogItem {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category?: string;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  in_stock?: boolean;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Doing with Excellence.",
    subtitle:
      "To define quality, cultivate unrivaled customer loyalty, and provide comprehensive solutions to customers' demands.",
    image: "/images/hero/hero1.webp",
    link: "/contact",
    buttonText: "Contact Us",
  },
  {
    id: 2,
    title: "Technology Built for Growth.",
    subtitle:
      "Secure networks, smarter systems, and reliable support that keep organizations moving forward.",
    image: "/images/hero/hero2.webp",
    link: "/services",
    buttonText: "Explore Services",
  },
  {
    id: 3,
    title: "Your Trusted IT Partner.",
    subtitle:
      "From design to deployment, we help businesses and institutions build resilient digital infrastructure.",
    image: "/images/hero/hero3.webp",
    link: "/about",
    buttonText: "About SysNet",
  },
];

export const services: ServiceItem[] = [
  {
    id: 1,
    slug: "computing",
    name: "Computing",
    title: "Computing",
    shortDescription:
      "Robust computing infrastructure and dependable support for organizations that depend on reliable digital operations.",
    description:
      "Computing is an advanced IT service offered by SysNet Technologies. Our customers for this kind of service are typically factories and international NGOs, organizations that require dependable, professionally managed computing infrastructure to support their operations.",
    features: [
      "Server installation and configuration",
      "Datacenter facilities",
      "System maintenance and support",
    ],
    image: "/images/services/service1.jpg",
  },
  {
    id: 2,
    slug: "solutions",
    name: "Solutions",
    title: "Solutions",
    shortDescription:
      "Tailor-made technology solutions that simplify workflows, increase productivity, and support business growth.",
    description:
      "Solutions is a customized technology service designed to improve efficiency, productivity, and overall business performance for our clients. We deliver practical and scalable systems for organizations looking to streamline operations and improve service delivery.",
    features: [
      "Custom software and systems integration",
      "Business process automation",
      "Technology needs assessment and planning",
    ],
    image: "/images/services/service2.jpg",
  },
  {
    id: 3,
    slug: "network-and-security",
    name: "Network & Security",
    title: "Computer Networking and Security",
    shortDescription:
      "Secure, scalable networking and protection strategies designed to keep critical systems stable and resilient.",
    description:
      "Computer Networking and Security focuses on designing, installing, managing, and protecting computer networks to ensure reliable communication and data security. We support businesses and institutions with secure and high-performing infrastructure.",
    features: [
      "Network design and installation",
      "Firewall and cybersecurity setup",
      "Network monitoring and maintenance",
      "Data security and protection",
    ],
    image: "/images/services/service3.jpg",
  },
  {
    id: 4,
    slug: "sales",
    name: "Sales",
    title: "Sales",
    shortDescription:
      "Access to trusted hardware, software, and IT products that match your operational and budget requirements.",
    description:
      "Sales provides technology products, devices, and software solutions to meet customer requirements. We supply reliable hardware, networking equipment, and software for business and institutional use.",
    features: [
      "Computers and office equipment",
      "Networking hardware and cabling",
      "Licensed software solutions",
    ],
    image: "/images/services/service4.jpg",
  },
  {
    id: 5,
    slug: "consultancy",
    name: "Consultancy",
    title: "Consultancy",
    shortDescription:
      "Strategic guidance to help businesses plan, invest, and modernize with confidence.",
    description:
      "Consultancy provides professional technology advice and guidance to help businesses make better decisions about their IT infrastructure, systems, and digital strategies. We support organizations before they commit to major technology investments.",
    features: [
      "IT infrastructure planning and assessment",
      "Digital transformation strategy",
      "Technology vendor and solution advisory",
    ],
    image: "/images/services/service4.jpg",
  },
];

export const serviceCategories = services.map(({ slug, name }) => ({ slug, name }));

export const projects: ProjectItem[] = [
  {
    id: 1,
    title: "Network Installation",
    client: "OLWAY Petroleum",
    description:
      "Network installation covering 80 plus nodes for a reliable and scalable enterprise connectivity solution.",
    image: "/images/projects/project1.png",
    category: "Networking",
    year: "2024",
  },
  {
    id: 2,
    title: "Website Development",
    client: "PMC Ethiopia",
    description:
      "Modern website development tailored to strengthen digital presence and business communication.",
    image: "/images/projects/project2.jpg",
    category: "Web & Software",
    year: "2023",
  },
  {
    id: 3,
    title: "Network Installation",
    client: "Addis Continental Institute",
    description:
      "Network installation of 560 nodes designed for a large-scale, high-performance institutional infrastructure.",
    image: "/images/projects/project3.jpg",
    category: "Enterprise Infrastructure",
    year: "2023",
  },
  {
    id: 4,
    title: "Network Installation",
    client: "Enterprise Solutions Ltd",
    description:
      "Network installation of 50 nodes combined with web administration for dependable operational support.",
    image: "/images/projects/project4.jpg",
    category: "Networking & Admin",
    year: "2022",
  },
  {
    id: 5,
    title: "Website Development",
    client: "Financial Services Corp",
    description:
      "Website development focused on professional online presence, accessibility, and business growth support.",
    image: "/images/projects/project5.jpg",
    category: "Web & Portals",
    year: "2022",
  },
];

export const teamMembers: TeamMemberItem[] = [
  {
    id: 1,
    name: "Abel Samuel",
    role: "General Manager",
    image: "/images/team/team1.png",
    bio: "Executive technology leader with over a decade of IT infrastructure management experience.",
  },
  {
    id: 2,
    name: "Frehiwot Endalkachew",
    role: "Co-Founder and Marketing Manager",
    image: "/images/team/team2.jpg",
    bio: "Strategic partner leading brand growth and institutional client relations.",
  },
  {
    id: 3,
    name: "Nahom Berhanu",
    role: "Web Developer",
    image: "/images/team/team3.jpg",
    bio: "Full stack engineer specializing in robust web applications and cloud integrations.",
  },
  {
    id: 4,
    name: "Kirubel E.",
    role: "Support Specialist",
    image: "/images/team/team4.jpg",
    bio: "Certified systems specialist providing rapid support and maintenance across enterprise networks.",
  },
];

export const partners: PartnerItem[] = [
  { id: 1, name: "OLWAY", logo: "/images/partners/partner1.jpg", website: "https://example.com" },
  { id: 2, name: "PMC", logo: "/images/partners/partner2.jpg", website: "https://example.com" },
  { id: 3, name: "Addis Continental", logo: "/images/partners/partner3.jpg", website: "https://example.com" },
  { id: 4, name: "SysNet Client", logo: "/images/partners/partner4.jpg", website: "https://example.com" },
  { id: 5, name: "Institutional Partner", logo: "/images/partners/partner5.jpg", website: "https://example.com" },
];

export const blogs: BlogItem[] = [
  {
    id: 1,
    slug: "building-secure-enterprise-networks",
    title: "Building Resilient Enterprise Networks in 2026",
    excerpt: "Discover essential architectural principles and cybersecurity strategies to protect modern institutional infrastructure.",
    content: `In today's interconnected landscape, enterprise networks are the backbone of institutional operations. From high-throughput fiber uplinks to next-generation firewall policies, designing resilience into every layer is critical.

### Key Tenets of Modern Network Design:
1. **Redundancy**: Implement multi-WAN failover and redundant core switches to eliminate single points of failure.
2. **Segmentation**: Isolate internal operational workloads from public guest networks using VLANs and zero-trust ACLs.
3. **Continuous Monitoring**: Deploy proactive telemetry to detect abnormal spikes or latency issues before they impact end users.

SysNet Technologies provides end-to-end network engineering from structured cabling to active infrastructure management.`,
    image: "/images/services/service3.jpg",
    author: "Abel Samuel",
    date: "August 24, 2026",
    category: "Networking & Security",
  },
  {
    id: 2,
    slug: "streamlining-it-procurement",
    title: "How Smart IT Procurement Reduces Downtime",
    excerpt: "Selecting high quality hardware and certified networking gear saves organizations significant cost and troubleshooting time.",
    content: `Choosing the right IT equipment is more than comparing specs on a sheet. It involves lifecycle planning, warranty support, and compatibility with your existing environment.

### Why Quality Hardware Matters:
- Lower failure rates across critical production switches and routers.
- Genuine components ensure compatibility with high-speed transceivers.
- Vendor warranties and fast parts replacement reduce operational halts.

Visit our shop to explore verified enterprise equipment and request bulk institutional quotes directly online.`,
    image: "/images/services/service4.jpg",
    author: "Nahom Berhanu",
    date: "August 18, 2026",
    category: "Hardware & Sales",
  },
  {
    id: 3,
    slug: "custom-software-business-growth",
    title: "Custom Software Solutions for Growing Businesses",
    excerpt: "Tailor-made portals and database workflows empower teams to scale without operational bottlenecks.",
    content: `Off-the-shelf software often leaves gaps in reporting, inventory tracking, and client self-service. Custom web applications bridge these gaps by aligning software directly to your business processes.

With SysNet Solutions, we design scalable portals and integrations that streamline transactions and customer interactions seamlessly.`,
    image: "/images/services/service2.jpg",
    author: "Frehiwot Endalkachew",
    date: "August 10, 2026",
    category: "Digital Solutions",
  },
];

export const products: ProductItem[] = [
  {
    id: 1,
    name: "Networking Cable",
    price: 25.0,
    image: "/products/product1.jpg",
    category: "Networking",
    description: "High speed shielded Cat6 RJ45 patch cable for durable connectivity.",
    in_stock: true,
  },
  {
    id: 2,
    name: "Wireless Router",
    price: 80.0,
    image: "/products/product2.jpg",
    category: "Networking",
    description: "Dual-band Gigabit wireless router with advanced encryption and coverage.",
    in_stock: true,
  },
  {
    id: 3,
    name: "Construction Per Work",
    price: 750.0,
    image: "/products/product3.jpg",
    category: "Computers",
    description: "Professional computer and workstation deployment package.",
    in_stock: true,
  },
  {
    id: 4,
    name: "Ethernet Switch",
    price: 45.0,
    image: "/products/product5.jpg",
    category: "Networking",
    description: "8-port Gigabit unmanaged desktop switch with auto MDI/MDIX.",
    in_stock: true,
  },
  {
    id: 5,
    name: "Enterprise Server Rack",
    price: 1200.0,
    image: "/products/product6.jpg",
    category: "Computers",
    description: "Heavy duty 42U server cabinet with cooling fans and cable management.",
    in_stock: true,
  },
  {
    id: 6,
    name: "Multi Mode FSP",
    price: 180.0,
    image: "/products/product9.jpg",
    category: "Networking",
    description: "Optical multi-mode fiber transceiver module for ultra-fast backbone data.",
    in_stock: true,
  },
];

export const stats = [
  { label: "Projects", value: 50 },
  { label: "Clients", value: 30 },
  { label: "Success", value: 5 },
  { label: "Awards", value: 15 },
];
