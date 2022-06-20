// $( "#datefield" ).datepicker({
  // firstDay: 1
// });

$("#datefield").datepicker({
    dateFormat: 'dd.mm.yy',// + ", " + now.toLocaleTimeString(),
	onSelect: function(dateText) {
		let time = new Date(dateText.split('.')[2], dateText.split('.')[1]-1, dateText.split('.')[0], now.getHours(), now.getMinutes());
		now = time;
		setSunPositionDate(time);
		this.value = time.toLocaleString();
        //console.log("Selected date: " + dateText + "; input's current value: " + time);
    }
});

// $( function() {
	// $( "#datefield" ).datepicker();
// } );


// Finds the batch table of an object in a 3D Tiles layer. This is
// for instance needed when picking because we pick the geometric
// object which is not at the same level in the layer structure as
// the  batch table. More details here on itowns internal
// organization of 3DTiles:
// https://github.com/MEPP-team/RICT/blob/master/Doc/iTowns/Doc.md#itowns-internal-organisation-of-3d-tiles-data
function findBatchTable(object) {
    if (object.batchTable) {
        return object.batchTable;
    }
    if (object.parent) {
        return findBatchTable(object.parent);
    }
    return undefined;
}

// Finds the intersected object with a batch id and returns an object
// storing this batch id and the batch table of this object
function getPickedBatchInfo(intersects) {
    for (var i = 0; i < intersects.length; i++) {
        // interAttributes are glTF attributes of b3dm tiles (i.e.
        // position, normal, batch id)
        var interAttributes = intersects[i].object.geometry.attributes;
        // eslint-disable-next-line no-debugger
        if (interAttributes) {
            var batchIDs = interAttributes._BATCHID || interAttributes.batchId;
            if (batchIDs) {
                // face is a Face3 object of THREE which is a
                // triangular face. face.a is its first vertex
                var vertex = intersects[i].face.a;
                // get batch id of the face
                var batchID = batchIDs.array[vertex];
                var batchTable = findBatchTable(
                    intersects[i].object);

                return {
                    batchID: batchID,
                    batchTable: batchTable,
                };
            }
        }
    }
}

function fillModalWith3DTilesPickingInfo(event, view, pickingArg) {
    // Remove content already in html div
    // while (pickingArg.htmlDiv.firstChild) {
        // pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    // }
	if ( pickingArg.intersects.length > 0 ) {
		pickingArg.intersects[0].object.material = pickingArg.material;
		view.notifyChange();
	}

	if ( ! pickingArg.layer.visible ) { return;};
	
console.log(pickingArg.layer.id,pickingArg.intersects.length);	

    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer);
	pickingArg.intersects = intersects;

console.log(pickingArg.layer.id,pickingArg.intersects.length);	


    var batchInfo = getPickedBatchInfo(intersects);
    if (!batchInfo) {
		if (modalPopUp == pickingArg.layer.id) {
			pickingArg.htmlDiv.style.display = "none";
		}
        return;
    }
    var batchID = batchInfo.batchID;
    var batchTable = batchInfo.batchTable;
	
	modalPopUp = pickingArg.layer.id;
	
    while (pickingArg.htmlDiv.firstChild) {
        pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    }

//console.log(view);
//console.log(intersects[0].object);
//console.log(intersects[0].object.localToWorld());

    intersects[0].object.material = new THREE.MeshLambertMaterial({ color: 0x00ffdc });
	view.notifyChange();

//console.log(intersects[0].object);

    var head = document.createElement('h2');
	head.appendChild(
        document.createTextNode('Feature Information'));
		
    var item = document.createElement('li');
    item.appendChild(
        document.createTextNode('Batch id: '));
    item.appendChild(document.createTextNode(batchID));
    var list = document.createElement('ul');
    // Change the padding (top: 0, right:0, bottom:0 and
    // left:1.5)
    list.style.padding = '0 0 0 1.5rem';
    list.appendChild(item);
    pickingArg.htmlDiv.appendChild(head);
    pickingArg.htmlDiv.appendChild(list);
	pickingArg.htmlDiv.style.padding = '20px';
	
	pickingArg.htmlDiv.style.display = 'inline-block';
	pickingArg.htmlDiv.style.textAlign = 'left';

    //var featureDisplayableInfo = batchTable.getPickingInfo(batchID);
    var featureDisplayableInfo = batchTable.getInfoById(batchID);
    pickingArg.htmlDiv.appendChild(createHTMLListFromObject(featureDisplayableInfo));
	
    var newlink = document.createElement('a');
	//newlink.setAttribute('title', 'https://livinglab-essigfabrik.eu');
	newlink.innerHTML = 'https://livinglab-essigfabrik.eu';
	newlink.setAttribute('href', 'https://livinglab-essigfabrik.eu');
	newlink.setAttribute('target', '_blank');
	pickingArg.htmlDiv.appendChild(newlink);
	//newlink.appendChild(
    //    document.createTextNode('https://livinglab-essigfabrik.eu'));
	//pickingArg.htmlDiv.appendChild(newlink);

//console.log("modal");	
	
	pickingArg.htmlDiv.style.display = "block";
}


// TODO: Übergabe der HTML per Funktion

function fillModalWithWoMaPickingInfo(event, view, pickingArg) {
	// TODO: Dirty!!!
	if (event.buttons) { return;};

    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer.object3d);

    if (intersects.length == 0) {
		pickingArg.htmlDiv.style.display = "none";
        return;
    }

    // Remove content already in html div
    while (pickingArg.htmlDiv.firstChild) {
        pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    }

//console.log("tip", pickingArg.layer);	
//console.log('intersect', intersects[0]); //.object);

    var head = document.createElement('h2');
	head.appendChild(
        document.createTextNode(pickingArg.layer.id));
		
    pickingArg.htmlDiv.appendChild(head);
	pickingArg.htmlDiv.style.padding = '20px';
	
	pickingArg.htmlDiv.style.display = 'inline-block';
	pickingArg.htmlDiv.style.textAlign = 'left';

    var list = document.createElement('ul');
	list.style.listStyleType = 'none';
	list.style.paddingLeft = 0;
	
	let item1 = document.createElement('li');
	item1.innerHTML = intersects[0].object.feature.geometries[0].properties.f1;
	
	list.appendChild(item1);
	
	let item2 = document.createElement('li');
	item2.innerHTML = intersects[0].object.feature.geometries[0].properties.f4;
	
	list.appendChild(item2);
	
	let item3 = document.createElement('li');
	item3.innerHTML = intersects[0].object.feature.geometries[0].properties.f5 + 
		" " + intersects[0].object.feature.geometries[0].properties.f6 +
		" - " + intersects[0].object.feature.geometries[0].properties.f7;
	
	list.appendChild(item3);
	
	let item4 = document.createElement('li');
	item4.innerHTML = intersects[0].object.feature.geometries[0].properties.f3;
	
	list.appendChild(item4);
	
	pickingArg.htmlDiv.appendChild(list);
	
    var newlink = document.createElement('a');
	newlink.innerHTML = intersects[0].object.feature.geometries[0].properties.f2;
	newlink.setAttribute('href', intersects[0].object.feature.geometries[0].properties.f2);
	newlink.setAttribute('target', '_blank');
	pickingArg.htmlDiv.appendChild(newlink);

	
	
	pickingArg.htmlDiv.style.display = "block";
}

function fillModalWithApoPickingInfo(event, view, pickingArg) {

	// TODO: Dirty!!!
	if (event.buttons) { return;};

    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer.object3d);

    if (intersects.length == 0) {
		pickingArg.htmlDiv.style.display = "none";
        return;
    }

    // Remove content already in html div
    while (pickingArg.htmlDiv.firstChild) {
        pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    }

//console.log("tip", pickingArg.layer);	
//console.log('intersect', intersects[0]); //.object);

    var head = document.createElement('h2');
	head.appendChild(
        document.createTextNode(pickingArg.layer.id));
		
    pickingArg.htmlDiv.appendChild(head);
	pickingArg.htmlDiv.style.padding = '20px';
	
	pickingArg.htmlDiv.style.display = 'inline-block';
	pickingArg.htmlDiv.style.textAlign = 'left';

    var list = document.createElement('ul');
	list.style.listStyleType = 'none';
	list.style.paddingLeft = 0;
	
	let item5 = document.createElement('li');
	item5.innerHTML = intersects[0].object.feature.geometries[0].properties.Telefon;
	
	list.appendChild(item5);
	
	let item1 = document.createElement('li');
	item1.innerHTML = intersects[0].object.feature.geometries[0].properties.Apotheke;
	
	list.appendChild(item1);
	
	let item2 = document.createElement('li');
	item2.innerHTML = intersects[0].object.feature.geometries[0].properties.Straße;
	
	list.appendChild(item2);
	
	let item3 = document.createElement('li');
	item3.innerHTML = intersects[0].object.feature.geometries[0].properties.PLZ + 
		" " + intersects[0].object.feature.geometries[0].properties.Ort;
	
	list.appendChild(item3);
	
	let item4 = document.createElement('li');
	item4.innerHTML = intersects[0].object.feature.geometries[0].properties.Ortsteil;
	
	list.appendChild(item4);
	
	let item6 = document.createElement('p');
	item6.innerHTML = 'Notdienst am ' + intersects[0].object.feature.geometries[0].properties.Datum + ' ab 9:00 bis 9:00 des folgenden Tages';
	
	list.appendChild(item6);
	
	pickingArg.htmlDiv.appendChild(list);
	
	pickingArg.htmlDiv.style.display = "block";
}


function fillModalWithCoronaPickingInfo(event, view, pickingArg) {

	// TODO: Dirty!!!
	if (event.buttons) { return;};

    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer.object3d);

    if (intersects.length == 0) {
		pickingArg.htmlDiv.style.display = "none";
        return;
    }

    // Remove content already in html div
    while (pickingArg.htmlDiv.firstChild) {
        pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    }

//console.log("tip", intersects[0].object.feature.geometries[0].properties);	
//console.log('intersect', intersects[0]); //.object);

    var head = document.createElement('h2');
	head.appendChild(
        document.createTextNode(pickingArg.layer.id));
		
    pickingArg.htmlDiv.appendChild(head);
	pickingArg.htmlDiv.style.padding = '20px';
	
	pickingArg.htmlDiv.style.display = 'inline-block';
	pickingArg.htmlDiv.style.textAlign = 'left';

    var list = document.createElement('ul');
	list.style.listStyleType = 'none';
	list.style.paddingLeft = 0;
	
	let item5 = document.createElement('li');
	item5.innerHTML = intersects[0].object.feature.geometries[0].properties.name;
	
	list.appendChild(item5);
	
	let item1 = document.createElement('li');
	item1.innerHTML = intersects[0].object.feature.geometries[0].properties.Hinweis;
	
	list.appendChild(item1);
	
	let item2 = document.createElement('li');
	item2.innerHTML = intersects[0].object.feature.geometries[0].properties.Öffnungszeiten;
	
	list.appendChild(item2);
	
	let item3 = document.createElement('li');
	item3.innerHTML = "<br><b>Bitte Marker anklicken, um den Link zu öffnen.</b>";
	
	list.appendChild(item3);
	
	pickingArg.htmlDiv.appendChild(list);
	
    var newlink = document.createElement('a');
	newlink.innerHTML = intersects[0].object.feature.geometries[0].properties.Link;
	newlink.setAttribute('href', intersects[0].object.feature.geometries[0].properties.Link);
	newlink.setAttribute('target', '_blank');
	pickingArg.htmlDiv.appendChild(newlink);
	
	pickingArg.htmlDiv.style.display = "block";
}

function openCoronaPickingLink(event, view, pickingArg) {
    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer.object3d);

    if (intersects.length == 0) {
        return;
    }
	
	window.open(intersects[0].object.feature.geometries[0].properties.Link, '_blank');

//console.log("tip", intersects[0].object.feature.geometries[0].properties);	
//console.log('intersect', intersects[0]); //.object);
}


function openSelectionPickingLink(event, view, pickingArg) {
    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer.object3d);

    if (intersects.length == 0) {
        return;
    }
	
	window.open(intersects[0].object.feature.geometries[0].properties.link, '_blank');

//console.log("tip", intersects[0].object.feature.geometries[0].properties);	
//console.log('intersect', intersects[0]); //.object);
}

function fillModalWithSelectionPickingInfo(event, view, pickingArg) {

	// TODO: Dirty!!!
	if (event.buttons) { return;};

    //var intersects = view.pickObjectsAt(event, 20, pickingArg.layer);
    var intersects = view.pickObjectsAt(event, 5, pickingArg.layer);

    if (intersects.length == 0) {
		//pickingArg.htmlDiv.style.display = "none";
        return;
    }

    // Remove content already in html div
    while (pickingArg.htmlDiv.firstChild) {
        pickingArg.htmlDiv.removeChild(pickingArg.htmlDiv.firstChild);
    }

//console.log("tip", intersects[0].object.feature.geometries[0].properties);	
//console.log('intersect', intersects); //.object);

	var span = document. createElement("span");
	span.classList.add("close");
	span.innerHTML = '&times;';
	span.onclick = closeModal;
	pickingArg.htmlDiv.appendChild(span);

    var head = document.createElement('h2');
	head.appendChild(
        document.createTextNode(pickingArg.layer.id));
		
    pickingArg.htmlDiv.appendChild(head);
	pickingArg.htmlDiv.style.padding = '20px';
	
	pickingArg.htmlDiv.style.display = 'inline-block';
	pickingArg.htmlDiv.style.textAlign = 'left';

    var list = document.createElement('ul');
	list.style.listStyleType = 'none';
	list.style.paddingLeft = 0;
	
	let item0 = document.createElement('li');
	item0.innerHTML = 'id: ' + intersects[0].object.feature.geometries[0].properties.id;
	
	list.appendChild(item0);
	
	let item1 = document.createElement('li');
	item1.innerHTML = 'max. Anzahl an Personen: '+intersects[0].object.feature.geometries[0].properties.maxperson;
	
	list.appendChild(item1);
	
	let item2 = document.createElement('li');
	item2.innerHTML = 'Fläche: '+intersects[0].object.feature.geometries[0].properties.flaeche + ' m²';
	
	list.appendChild(item2);
	
	let item3 = document.createElement('li');
	item3.innerHTML = "<br><b>Bitte Ort anklicken, um weitere Informationen zu erhalten.</b>";
	
	list.appendChild(item3);
	
	pickingArg.htmlDiv.appendChild(list);
	

    var inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = "Auswählen";
    //inputElement.onclick = anfragen(pickingArg.htmlDiv, intersects[0].object.feature.geometries[0].properties.id);
	inputElement.addEventListener('click', function(){
		anfragen(pickingArg.htmlDiv, intersects[0].object.feature.geometries[0].properties.id);
	});
    pickingArg.htmlDiv.appendChild(inputElement);
	
	
	
    // var newlink = document.createElement('a');
	// newlink.innerHTML = intersects[0].object.feature.geometries[0].properties.Link;
	// newlink.setAttribute('href', intersects[0].object.feature.geometries[0].properties.Link);
	// newlink.setAttribute('target', '_blank');
	// pickingArg.htmlDiv.appendChild(newlink);
	
	pickingArg.htmlDiv.style.display = "block";
}

function anfragen(div, id) {
	// window.botpressWebChat.sendEvent({
		// type: 'message',
		// //channel: 'web',
		// payload: { text: id }
	// })
	window.botpressWebChat.sendEvent({ type: 'message', text: 'Ich wähle ' + String(id) })
	//window.botpressWebChat.sendEvent({ type: 'message', text: String(id) })
	
	div.style.display = "none";
}

function closeModal(click) {
	click.target.parentNode.style.display = "none";
}
