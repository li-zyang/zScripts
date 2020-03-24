# noopener-everywhere
open any hyperlinks with a noopener attribute

## Why use noopener?

<blockquote>

### Performance  
When you open another page using target="\_blank", the other page may run on the 
same process as your page, unless Site Isolation is enabled. If the other page 
is running a lot of JavaScript, your page's performance may also suffer. See The
Performance Benefits of rel=noopener.

### Security
The other page can access your window object with the window.opener property. 
This exposes an attack surface because the other page can potentially redirect 
your page to a malicious URL. See About rel=noopener.

### Recommendations
Add rel="noopener" or rel="noreferrer" to each of the links that Lighthouse has 
identified in your report. In general, when you use target="\_blank", always add 
rel="noopener" or rel="noreferrer".

</blockquote>

-- [Google Developers](https://developers.google.com/web/tools/lighthouse/audits/noopener)

The most obvious effect is that the page loads much faster than that the 
"noopener" is absent. 