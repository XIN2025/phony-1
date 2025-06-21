import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const testimonials = [
  {
    quote:
      "Heizen has transformed how we manage our development workflow. It's the perfect tool for modern teams.",
    author: 'Sofia Davis',
    role: 'Engineering Lead',
    initials: 'SD',
  },
  {
    quote:
      "The best development platform I've used in years. The automation features are incredible.",
    author: 'Alex Thompson',
    role: 'CTO',
    initials: 'AT',
  },
  {
    quote:
      "Our team's productivity increased by 40% after switching to Heizen. The integration capabilities are unmatched.",
    author: 'Maria Rodriguez',
    role: 'DevOps Manager',
    initials: 'MR',
  },
];

export const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  const [, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative grid min-h-screen flex-col items-center justify-center p-3">
      {/* <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-linear-to-tr from-primary to-primary/80"> lg:max-w-none lg:grid-cols-2 lg:px-0</div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
          <span className="ml-2">Heizen</span>
        </div>

        <div className="relative z-20 mt-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                index === currentTestimonial ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <blockquote className="space-y-2">
                <p className="text-xl">{testimonial.quote}</p>
                <footer className="text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>

        <div className="relative z-20 mt-auto pt-8">
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 rounded-full transition-all duration-500',
                  index === currentTestimonial ? 'w-16 bg-white/60' : 'w-4 bg-white/20',
                )}
              />
            ))}
          </div>
        </div>
      </div> */}
      <div className="lg:p-8">
        <div
          className={cn(
            'mx-auto flex w-full flex-col justify-center space-y-6 md:max-w-[550px]',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
