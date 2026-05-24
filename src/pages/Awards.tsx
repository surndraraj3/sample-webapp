import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Medal, Star, Shield, Target } from "lucide-react";

interface AwardItem {
    id: number;
    title: string;
    year: string;
    category: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const awards: AwardItem[] = [
    {
        id: 1,
        title: "ISO 9001:2015 Certification",
        year: "2024",
        category: "Quality Management",
        description: "Internationally recognized certification for quality management systems, demonstrating our commitment to maintaining the highest standards in water solutions.",
        icon: <Shield className="h-12 w-12" />,
        color: "text-blue-600"
    },
    {
        id: 2,
        title: "Best Water Solutions Provider",
        year: "2025",
        category: "Industry Excellence",
        description: "Awarded by the National Water Technology Association for outstanding innovation and customer satisfaction in water purification and management solutions.",
        icon: <Trophy className="h-12 w-12" />,
        color: "text-yellow-600"
    },
    {
        id: 3,
        title: "Innovation Excellence Award",
        year: "2024",
        category: "Product Innovation",
        description: "Recognized for developing cutting-edge water treatment technologies that have revolutionized the industry standards for efficiency and sustainability.",
        icon: <Star className="h-12 w-12" />,
        color: "text-purple-600"
    },
    {
        id: 4,
        title: "Customer Satisfaction Gold Medal",
        year: "2024",
        category: "Service Excellence",
        description: "Honored with the highest customer satisfaction rating (98%) among water solutions providers, based on feedback from over 5000+ satisfied customers.",
        icon: <Medal className="h-12 w-12" />,
        color: "text-orange-600"
    },
    {
        id: 5,
        title: "Environmental Stewardship Award",
        year: "2023",
        category: "Sustainability",
        description: "Commended for implementing eco-friendly practices and developing sustainable water management solutions that reduce environmental impact.",
        icon: <Award className="h-12 w-12" />,
        color: "text-green-600"
    },
    {
        id: 6,
        title: "Top Distributor Network Award",
        year: "2025",
        category: "Business Excellence",
        description: "Achieved the strongest dealer network in South India with 500+ authorized dealers, ensuring widespread product availability and exceptional service.",
        icon: <Target className="h-12 w-12" />,
        color: "text-red-600"
    }
];

const stats = [
    { label: "Years of Excellence", value: "15+" },
    { label: "Happy Customers", value: "5,000+" },
    { label: "Authorized Dealers", value: "500+" },
    { label: "Products Delivered", value: "50,000+" }
];

const Awards = () => {
    return (
        <SiteLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 py-20">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <Trophy className="h-5 w-5" />
                            <span className="font-semibold">Recognized for Excellence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Awards & Recognitions
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Our commitment to quality, innovation, and customer satisfaction has earned us
                            numerous prestigious awards and certifications in the water solutions industry.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border-2">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Awards Grid */}
            <section className="container pb-20">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Achievements</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Each award represents our unwavering dedication to excellence and our mission
                        to provide the best water solutions to our valued customers.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {awards.map((award) => (
                        <Card
                            key={award.id}
                            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
                        >
                            <CardContent className="p-6">
                                {/* Icon and Year */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${award.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        {award.icon}
                                    </div>
                                    <Badge variant="secondary" className="font-semibold">
                                        {award.year}
                                    </Badge>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {award.title}
                                </h3>

                                {/* Category */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="text-xs">
                                        {award.category}
                                    </Badge>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {award.description}
                                </p>

                                {/* Decorative Element */}
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Award className="h-3 w-3" />
                                        <span>Official Recognition</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Certifications Section */}
            <section className="bg-muted/50 py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Quality Certifications</h2>
                        <p className="text-muted-foreground mb-8">
                            We maintain the highest industry standards through rigorous certification processes
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Shield className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                                    <h3 className="font-semibold mb-1">ISO 9001:2015</h3>
                                    <p className="text-sm text-muted-foreground">Quality Management</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Shield className="h-10 w-10 mx-auto mb-3 text-green-600" />
                                    <h3 className="font-semibold mb-1">ISO 14001:2015</h3>
                                    <p className="text-sm text-muted-foreground">Environmental Management</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Shield className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                                    <h3 className="font-semibold mb-1">CE Certified</h3>
                                    <p className="text-sm text-muted-foreground">European Standards</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="container py-16">
                <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl p-12 text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-6 opacity-90" />
                    <h2 className="text-3xl font-bold mb-4">
                        Excellence is Our Standard
                    </h2>
                    <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and dealers who trust MSI Innovations
                        for their water solution needs. Experience award-winning quality today.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="/products"
                            className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
                        >
                            View Products
                        </a>
                        <a
                            href="/about"
                            className="inline-flex items-center gap-2 border-2 border-background text-background px-6 py-3 rounded-lg font-semibold hover:bg-background/10 transition-colors"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
};

export default Awards;
