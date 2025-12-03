import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Senior Account Executive",
    company: "Salesforce",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    quote: "Saved me 3+ hours at every tradeshow. I just snap photos and all leads are in HubSpot before I leave the booth.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Regional Sales Manager",
    company: "Oracle",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    quote: "Finally, no more manually typing in business cards. This thing is a game changer for our field sales team.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Business Development Rep",
    company: "SAP",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg",
    quote: "I collected 200+ cards at Dreamforce. Had them all digitized and followed up the same evening. Magic!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Loved by sales teams
      </div>
      
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3 hover:bg-card/70 transition-colors"
          >
            <div className="flex items-start gap-3">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">
                    {testimonial.name}
                  </span>
                  <img
                    src={testimonial.logo}
                    alt={testimonial.company}
                    className="h-4 w-auto opacity-70"
                  />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {testimonial.role}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              "{testimonial.quote}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
