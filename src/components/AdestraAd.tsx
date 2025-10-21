import { useEffect } from 'react';

export const AdestraAd = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//pl27895130.effectivegatecpm.com/a6e93bf85907452de36317a8371b04bf/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    
    const container = document.getElementById('container-a6e93bf85907452de36317a8371b04bf');
    if (container && container.parentNode) {
      container.parentNode.insertBefore(script, container);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="container-a6e93bf85907452de36317a8371b04bf"></div>;
};
