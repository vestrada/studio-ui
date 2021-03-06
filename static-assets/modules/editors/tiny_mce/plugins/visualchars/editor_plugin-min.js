(function(){tinymce.create("tinymce.plugins.VisualChars",{init:function(e,d){var f=this;
f.editor=e;
e.addCommand("mceVisualChars",f._toggleVisualChars,f);
e.addButton("visualchars",{title:"visualchars.desc",cmd:"mceVisualChars"});
e.onBeforeGetContent.add(function(b,a){if(f.state&&a.format!="raw"&&!a.draft){f.state=true;
f._toggleVisualChars(false)
}})
},getInfo:function(){return{longname:"Visual characters",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/visualchars",version:tinymce.majorVersion+"."+tinymce.minorVersion}
},_toggleVisualChars:function(r){var d=this,t=d.editor,z,v,u,i=t.getDoc(),h=t.getBody(),s,b=t.selection,x,y,w;
d.state=!d.state;
t.controlManager.setActive("visualchars",d.state);
if(r){w=b.getBookmark()
}if(d.state){z=[];
tinymce.walk(h,function(a){if(a.nodeType==3&&a.nodeValue&&a.nodeValue.indexOf("\u00a0")!=-1){z.push(a)
}},"childNodes");
for(v=0;
v<z.length;
v++){s=z[v].nodeValue;
s=s.replace(/(\u00a0)/g,'<span data-mce-bogus="1" class="mceItemHidden mceItemNbsp">$1</span>');
y=t.dom.create("div",null,s);
while(node=y.lastChild){t.dom.insertAfter(node,z[v])
}t.dom.remove(z[v])
}}else{z=t.dom.select("span.mceItemNbsp",h);
for(v=z.length-1;
v>=0;
v--){t.dom.remove(z[v],1)
}}b.moveToBookmark(w)
}});
tinymce.PluginManager.add("visualchars",tinymce.plugins.VisualChars)
})();