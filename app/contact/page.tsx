export default function ContactPage() {
    return (
      <div className="bg-gray-100">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
            <div className="lg:flex lg:justify-center">
              <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg">
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
                    <input type="text" id="name" name="name" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                    <input type="email" id="email" name="email" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">Phone</label>
                    <input type="tel" id="phone" name="phone" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 font-bold mb-2">Subject</label>
                    <input type="text" id="subject" name="subject" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
                    <textarea id="message" name="message" rows={5} className="w-full px-3 py-2 border rounded-lg"></textarea>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300">
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }