(function(b){b.onAddEditor.addToTop(function(d,a){a.settings.inline_styles=false
});
b.create("tinymce.plugins.LegacyOutput",{init:function(a){a.onInit.add(function(){var h="p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",f=b.explode(a.settings.font_size_style_values),g=a.schema;
a.formatter.register({alignleft:{selector:h,attributes:{align:"left"}},aligncenter:{selector:h,attributes:{align:"center"}},alignright:{selector:h,attributes:{align:"right"}},alignfull:{selector:h,attributes:{align:"justify"}},bold:[{inline:"b",remove:"all"},{inline:"strong",remove:"all"},{inline:"span",styles:{fontWeight:"bold"}}],italic:[{inline:"i",remove:"all"},{inline:"em",remove:"all"},{inline:"span",styles:{fontStyle:"italic"}}],underline:[{inline:"u",remove:"all"},{inline:"span",styles:{textDecoration:"underline"},exact:true}],strikethrough:[{inline:"strike",remove:"all"},{inline:"span",styles:{textDecoration:"line-through"},exact:true}],fontname:{inline:"font",attributes:{face:"%value"}},fontsize:{inline:"font",attributes:{size:function(c){return b.inArray(f,c.value)+1
}}},forecolor:{inline:"font",attributes:{color:"%value"}},hilitecolor:{inline:"font",styles:{backgroundColor:"%value"}}});
b.each("b,i,u,strike".split(","),function(c){g.addValidElements(c+"[*]")
});
if(!g.getElementRule("font")){g.addValidElements("font[face|size|color|style]")
}b.each(h.split(","),function(e){var c=g.getElementRule(e),d;
if(c){if(!c.attributes.align){c.attributes.align={};
c.attributesOrder.push("align")
}}});
a.onNodeChange.add(function(m,c){var d,n,l,e;
n=m.dom.getParent(m.selection.getNode(),"font");
if(n){l=n.face;
e=n.size
}if(d=c.get("fontselect")){d.select(function(i){return i==l
})
}if(d=c.get("fontsizeselect")){d.select(function(i){var j=b.inArray(f,i.fontSize);
return j+1==e
})
}})
})
},getInfo:function(){return{longname:"LegacyOutput",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/legacyoutput",version:b.majorVersion+"."+b.minorVersion}
}});
b.PluginManager.add("legacyoutput",b.plugins.LegacyOutput)
})(tinymce);