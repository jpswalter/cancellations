import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowUp, ArrowDown, Shield, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import Articles from './Articles';

const LandingPageContent = () => {
  return (
    <main className="flex-grow">
      <section className="text-center p-4">
        <h1 className="text-3xl md:text-5xl mb-4 mt-8 md:mt-10">
          Streamline Third-Party
          <br />
          Customer Support
        </h1>
        <p className="mb-4 max-w-prose mx-auto">
          ProxyLink allows you to quickly and securely resolve customer support
          requests submitted by third-parties (&quot;Proxies&quot;) on behalf of
          your customers.
        </p>
        <Link href="/schedule-demo">
          <Button color="blue" className="mt-2 h-12">
            Start for free
          </Button>
        </Link>
      </section>

      <section className="p-4 mt-8 md:mt-0">
        <div className="w-full">
          <Image
            src="/images/public_cover.png"
            alt="Cover"
            className="w-full h-auto hidden md:block"
            sizes="100vw"
            width={1200}
            height={600}
            priority
          />
          <Image
            src="/images/public_cover_mobile.png"
            alt="Cover"
            className="w-full h-auto md:hidden mt-10"
            sizes="100vw"
            width={600}
            height={300}
            priority
          />
        </div>
      </section>

      <section className="p-4 flex flex-col items-center">
        <div className="p-8 md:p-0 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4">
          {[
            {
              icon: <ArrowUp className="text-blue-600" />,
              title: 'Experience',
              description:
                'Work in tandem with proxies to deliver exceptional experiences.',
            },
            {
              icon: <ArrowDown className="text-blue-600" />,
              title: 'Cost',
              description:
                'Convert live support to asynchronous and automated.',
            },
            {
              icon: <Shield className="text-blue-600" />,
              title: 'Security',
              description:
                'Ensure proxies are authorized to act on behalf of your customers.',
            },
            {
              icon: <HeartHandshake className="text-blue-600" />,
              title: 'Compliance',
              description: 'Set boundaries that comply with FTC mandates.',
            },
          ].map((benefit, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div key={index} className="flex items-center gap-2">
                <div className="text-2xl mb-2">{benefit.icon}</div>
                <h3 className="text-3xl mb-2">{benefit.title}</h3>
              </div>
              <p className="max-w-60">{benefit.description}</p>
            </div>
          ))}
        </div>
        <Link href="/schedule-demo">
          <Button color="blue" className="h-12 mx-auto mt-10 md:mt-20">
            Schedule a demo
          </Button>
        </Link>
      </section>
      <Articles />
      <section className="text-center p-4 my-10">
        <h2 className="text-4xl mb-10">Contact a ProxyLink representative</h2>
        <Link href="/schedule-demo">
          <Button color="blue">Get in touch</Button>
        </Link>
      </section>
    </main>
  );
};

export default LandingPageContent;
