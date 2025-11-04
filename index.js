// Smooth scroll helper
    function scrollToId(id){
      document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'});
    }

    // Basic client side content filtering to reduce obviously bad input (server must validate anyway)
    function basicSanitize(s){
      return s.replace(/[<>]/g,''); // minimal; server must re-sanitize robustly
    }

    // Reads CSRF token from cookie if server sets one (optional)
    function readCookie(name){
      const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return m ? decodeURIComponent(m[2]) : null;
    }

    async function sendContact(e){
      e.preventDefault();
      const status = document.getElementById('status');
      status.textContent = '';
      const payload = {
        name: basicSanitize(document.getElementById('name').value.trim()),
        email: basicSanitize(document.getElementById('email').value.trim()),
        subject: basicSanitize(document.getElementById('subject').value.trim()),
        message: basicSanitize(document.getElementById('message').value.trim())
      };

      // Quick client side validation
      if(!payload.name || !payload.email || !payload.message){
        status.textContent = 'Please complete required fields.';
        return;
      }

      try{
        // Important: DO NOT hardcode secrets / API keys in client code.
        // Use an authorization flow: e.g. short-lived token from your backend or
        // rely on cookie-based session set by the backend.
        const API_URL = 'https://YOUR_API_ORIGIN/api/contact'; // <-- replace with real API
        const csrfToken = readCookie('XSRF-TOKEN'); // optional pattern if using cookie csurf

        const res = await fetch(API_URL, {
          method: 'POST',
          credentials: 'include', // include cookies if using cookie-auth
          headers: {
            'Content-Type': 'application/json',
            // Show two common protection headers. In many deployments, API key or Bearer is required.
            'Authorization': 'Api-Key YOUR_PUBLIC_CLIENT_TOKEN', // <-- NOT recommended for production; use token exchange
            ...(csrfToken ? {'X-XSRF-TOKEN': csrfToken} : {})
          },
          body: JSON.stringify(payload)
        });

        if(res.ok){
          status.textContent = 'Message sent — thank you.';
          document.getElementById('contactForm').reset();
        } else {
          const j = await res.json().catch(()=>({message:'Server error'}));
          status.textContent = 'Error: ' + (j.message || res.statusText);
        }
      } catch(err){
        console.error(err);
        status.textContent = 'Failed to send message. Check network or contact directly.';
      }
    }