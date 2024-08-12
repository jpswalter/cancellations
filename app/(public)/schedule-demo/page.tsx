import ContactForm from '../components/ContactForm';

export default function ScheduleDemoPage() {
  return (
    <div className="flex flex-col md:flex-row py-8 md:py-16 gap-0 md:gap-40">
      <div className="w-full md:w-1/2">
        <h1 className="text-4xl mb-4">Schedule a Demo</h1>
        <p className="mb-12">
          Take full advantage of ProxyLink&apos;s tools for managing 3rd party
          customer support requests.
        </p>
        <iframe
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2Xy1-GkJaBCN8TCqZ48S2uR8q-LkngfDtmkUwwDCJ3U7HP0j86WRRTl0vIM4f5YjN2xnX1oZ9S?gv=true"
          style={{ border: 0, marginBottom: '100px' }}
          width="100%"
          height="600"
          frameBorder="0"
        ></iframe>
      </div>
      <div className="max-w-[380px] w-full md:w-1/">
        <h1 className="text-4xl mb-8">Contact Us</h1>
        <ContactForm />
      </div>
    </div>
  );
}
