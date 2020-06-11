# ghPreview
Render HTML files in Github  

![Screenshot](https://github.com/li-zyang/zScripts/raw/master/ghPreview/src/Snipaste_2020-06-11_09-52-41.png)

## Features
✓ Relative URL<sup>[1]</sup>  
✓ Avaliable for private repositories  
✓ Uncensored URL format<sup>[2]</sup>  
✓ Auto-generated catalogue  
✓ Adaptive page width & height<sup>[3]</sup>  
✓ Disable scripts  
✓ Fast loading<sup>[4]</sup>  
✓ Familiar layout with Github  
✓ Back to top  
✓ Easy to deploy elsewhere  
✗ Recognize wide pages  
✗ Recognize semantic title (not only `<h1>`, `<h2>` ...)  
✗ Option to put scripts back  

<sup><sub><sup>[1]</sup> Relative URLs are available everywhere for public 
repositories, but only available in `<script>`, `<style>`, `<img>` and 
`<source>` for private repositories, this is expected 
to be fixed in the future; besides, scripts and styles will be converted
 to be inline.</sub></sup>  
<sup><sub><sup>[2]</sup> For example, `https://li-zyang.github.io/ghPreview/?b3JpZ2luYWxVcmw9aHR0cHMlM0 ... h0bWwmcHJvdmlkZXI9dXNlcnNjcmlwdA==`</sub></sup>  
<sup><sub><sup>[3]</sup> The initial size of the "paper" is set by recognizing the
viewport meta, and follow the scollWidth (or scrollHeight) of the whole 
document after it is loaded.</sub></sup>  
<sup><sub><sup>[4]</sup> Only avaliable for public repositories, proxied 
by <a href="https://www.jsdelivr.com/" rel="noopener">jsDelivr</a></sub></sup>  

## Installation
**[GreasyFork protal](https://greasyfork.org/en/scripts/405106-ghpreview)**  
Since Github set a ~~crazily~~ limitative [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), 
and the Firefox weirdly forbids the script scripts from extensions too, The
script only works with [Tampermonkey's latest beta version](https://www.tampermonkey.net/) for 
now in Firefox. This problem may not affect other browsers, install it 
as usual.  
<details>
  <summary>Read this if you use Firefox</summary>
  <p>
    <h3>Installation steps: </h3>
    <ol>
      <li>Install Tampermonkey BETA in the above link</li>
      <li>
        Migrate the scripts and configurations by exporting and 
        importing them in the "Utilities" tab if you need to  
        <br>
        <img src="https://github.com/li-zyang/zScripts/raw/master/ghPreview/src/Snipaste_2020-06-11_11-23-05.png" alt="Tampermonkey Utilities tab screenshot" />
      </li>
      <li>Use the BETA version to install this script</li>
      <li>
        In the "Security" section, set the "Modify existing content 
        security policy (CSP) headers" option to "Remove Entirely"  
        <br>
        <img src="https://github.com/li-zyang/zScripts/raw/master/ghPreview/src/Snipaste_2020-06-11_11-34-24.png" alt="Tampermonkey Security section screenshot" />
      </li>
      <li>Add the websites to keep the CSP headers if you need to</li>
      <li>done.</li>
    </ol>
  </p>
</details>

This problem may be fixed in the future version of Firefox.  

## Play With ghPreview
### Previewing A File
Open a repository contaning HTML files. The link of these files will be 
modified to the renderer page. Click it and you will see it rendered. 
The original behaviour (viewing the source code) can be obtained by 
clicking the small "view source code" icon after it.  

![Repository Screenshot](https://github.com/li-zyang/zScripts/raw/master/ghPreview/src/Snipaste_2020-06-11_11-54-34.png)

There is also a "Preview" button in the source code previewing page  

![Source Code Previewing Page Screenshot](https://github.com/li-zyang/zScripts/raw/master/ghPreview/src/Snipaste_2020-06-11_12-03-42.png)
which also leads to the render page.  

### Deploy Elsewhere
> It's not recommanded for now, since this script (and also the renderer
site) still has known bugs to fix. Deploy it elsewhere disables the 
automatic update.
1. Fork [li-zyang/ghPreview](https://github.com/li-zyang/ghPreview) or 
clone it locally
2. Open the Github Pages service in the repository setting or link it to 
the web server directory
3. Get the address of the site you set up
4. Replace `script.renderSite` in the userscript with that address
5. Also modify the `@include` and the `if` conditions that recognize the 
current location
6. done.

## Contribution
<pre>
<strong>ghPreview.user.js</strong>
Repository                        <a href="https://github.com/li-zyang/zScripts/tree/master/ghPreview">li-zyang/zScripts/ghPreview</a>
Report a bug / suggest a feature  <a href="https://github.com/li-zyang/zScripts/issues">Open an issue</a>
contribute code                   <a href="https://github.com/li-zyang/zScripts/pulls">Create a pull request</a>
<strong>ghPreview (renderer page)</strong>
Repository                        <a href="https://github.com/li-zyang/ghPreview">li-zyang/ghPreview</a>
Report a bug / suggest a feature  <a href="https://github.com/li-zyang/ghPreview/issues">Open an issue</a>
contribute code                   <a href="https://github.com/li-zyang/ghPreview/pulls">Create a pull request</a>
</pre>

## LICENSES
<pre>
<strong>package</strong>                   <strong>repo or website</strong>                       <strong>license</strong>
ghPreview (renderer page) <a href="https://github.com/li-zyang/ghPreview">li-zyang/ghPreview</a>                    <a href="https://github.com/li-zyang/ghPreview/blob/master/LICENSE">MIT</a>
ghPreview (userscript)    <a href="https://github.com/li-zyang/zScripts/tree/master/ghPreview">li-zyang/zScripts/ghPreview</a>           <a href="https://github.com/li-zyang/zScripts/blob/master/ghPreview/LICENSE">MIT</a>
mvp.css                   <a href="https://github.com/andybrewer/mvp">andybrewer/mvp</a>                        <a href="https://github.com/andybrewer/mvp/blob/master/LICENSE">MIT</a>
jQuery                    <a href="https://github.com/jquery/jquery">jquery/jquery</a>                         <a href="https://github.com/jquery/jquery/blob/master/LICENSE.txt">MIT</a>
</pre>