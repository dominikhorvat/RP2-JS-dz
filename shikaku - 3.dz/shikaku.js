$(document).ready(function() {
    // kod koji treba izvršiti kad se učita kod web-stranice
    //varijabla za prvi klik, pocetno false, tijekom prvog klika sve do drugog biti ce postavljena na true
    var prvi = false;
    //spremamo oznacene pravokutnike
    var pravokutnici = [];
    //boje koje su iskoristene pri oznacavanju
    var odabrane_boje = [];
    
    //brojac koji ce se povecavati izborom iduce boje, a dektrementirati tokom odznacavanja
    var brojac;

    var radioButtons;

    //izabir opcije u padajucem izborniku
    game.forEach((g,index) => {
        let option = $('<option></option>').val(index).text(g.name);
        $('#gameSelect').append(option);
    });

    //kada kliknemo na button Započni igru!
    $('#startGameButton').on('click',function() {
        let brojIgre = $('#gameSelect').val();
        let odabranaIgra = game[brojIgre];

        prvi = false;
        pravokutnici = [];
        odabrane_boje = [];
        brojac = 0;
        
        let $gameTable = $('#gameTable');
        
        $gameTable.empty();

        //crtamo tablicu
        let tablica = $('<table>');
        for(let i = 0; i < odabranaIgra.size; i++)
        {
            let redak = $('<tr>')
            for(let j = 0; j < odabranaIgra.size; j++)
            {
                let stupac = $('<td>').addClass('klik-celija').attr({ //pomocu attr pamtit cemo u row i col za svaku celiju koordinate
                    'row': i,
                    'col': j
                }); //ovdje da bi se registrirao klik

                for(let k = 0; k < odabranaIgra.num.length; k++){
                    if(i === (odabranaIgra.row[k]-1) && j === (odabranaIgra.col[k]-1)){
                        stupac.text(odabranaIgra.num[k]);
                    }
                }
                redak.append(stupac);
            }
            tablica.append(redak);
        }

        $gameTable.append(tablica);

        //dohvaćamo odgovarajuce boje
        let $bojeZaIgru = $('#colorPick');

        $bojeZaIgru.empty();

        for(let i = 0; i < odabranaIgra.color.length; i++){
            let $radio = $('<input>').attr({
                type: 'radio',
                name: 'color',
                value: odabranaIgra.color[i]
            });

            //za prikaz odredjene boje
            let $div = $('<div>').css({
                'width': '100px',
                'height': '20px',
                'background-color': odabranaIgra.color[i],
                'display': 'inline-block'
            });
            //dodajemo label da se boje nalaze uz odgovarajuci kruzic
            let $label = $('<label>').append($radio).append($div).append('<br>');
            $bojeZaIgru.append($label);
        }

        radioButtons = document.querySelectorAll('input[type="radio"]');

        //za blokiranje odgovarajuceg izbornika koji nastaje pri kliku desne tipke misa
        $('.klik-celija').on('contextmenu', function() { return false; });

        //omogucuje obradu lijevog klika
        $('.klik-celija').on('click', odaberiPrvu);

        //preostaje napraviti za desni klik
        $('.klik-celija').on('contextmenu', izbrisiPravokutnik);
    });

    function odaberiPrvu(){
        //odabrane koordinate prve ćelije
        let prva_row = $(this).attr('row');
        let prva_col = $(this).attr('col');
    
        //dodana provjera je li odabrana ćelija dio vec odabranog pravokutnika
        if (provjeraPocetne(prva_row, prva_col) === true) {
            alert("Ova ćelija je dio već označenog pravokutnika!");
            return;
        }
    
        // Provjera je li prva ćelija već odabrana, ako je false slijedi
        if (prvi === false) {
            // Postavljanje klase 'odabran' - definirana u .css, za prvu ćeliju
            $(this).addClass('odabran');
            prvi = true;

            //dodajemo odabranu boju
            dodajOdabranuBoju();

            //rjesenja za prvi potez u slucaju da odmah na pocetku se ne odabere boja za oznacavanje
            //bez ovoga if-a bi se oznacavali kvadrati koji ne bi bili obojani!
            if(dodajOdabranuBoju.size === 0){
                alert("Morate odabrati boju!");
                $('.klik-celija').removeClass('odabran');
                prvi = false;
                return;
            }

            //mora biti odabran barem jedan radio button 
            if (odabrane_boje.length === brojac) {
                alert("Morate odabrati boju!");
                $('.klik-celija').removeClass('odabran');
                prvi = false;
                return;
            }

            // Postavljanje funkcije za odabir druge ćelije
            $('.klik-celija').on('click', odaberiDrugu(prva_row, prva_col));
        }
    }
    
    function odaberiDrugu(prva_row, prva_col){
        return function() {
            let druga_row = $(this).attr('row');
            let druga_col = $(this).attr('col');

            //za postivanje pravila navedenog u pdf-u za 3.zadacu
            if(druga_row < prva_row || druga_col < prva_col){
                alert("Druga odabrana po pravilu ne može biti lijevo niti iznad prve odabrane!");
                return;
            }
    
            // poziv funkcije provjeraPostojeceg koja ce provjeriti preklapanje odabranog pravokutnika s vec postojecim
            // ako vrati true -> mozemo dodati novi pravokutnik, inace ispisemo odgovarajucu poruku!
            if(provjeraPostojeceg(prva_row, prva_col, druga_row, druga_col)){
                let dodaj_novi = {
                    rowPocetak : Math.min(prva_row, druga_row),
                    rowKraj: Math.max(prva_row, druga_row),
                    colPocetak: Math.min(prva_col, druga_col),
                    colKraj: Math.max(prva_col, druga_col)
                }

                pravokutnici.push(dodaj_novi);
                prvi = false;

                //micemo crveni obrub s prve odabrane celije, tj. svih radi jednostavnosti
                //iako je odabrana samo jedna
                $('.klik-celija').removeClass('odabran');

                //ako smo dosli do ove razine sve je ok i mozemo obojat odabrani pravokutnik
                obojiPravokutnik(dodaj_novi, odabrane_boje[brojac]);

                //onemogućit cemo radio button kada se korisnik "makne" s njega (linija 172), tako da više ne moze izabrati tu boju
                $('input[type="radio"][value="' + odabrane_boje[brojac] + '"]').prop('disabled', true);

                //odznacit cemo radio button nakon odg. koraka
                $('input[type="radio"]:checked').prop('checked', false);

                brojac++;//povecavamo za iducu boju

                // Uklanjanje klika za odabir druge celije
                $('.klik-celija').off('click');
                // Postavljanje klika za odabir prve celije
                $('.klik-celija').on('click', odaberiPrvu);
            }
            else{
                alert("Odabrani pravokutnik se preklapa s postojećim pravokutnikom!");
            }
        }
    }
    
    function provjeraPostojeceg(prva_row, prva_col, druga_row, druga_col){
        let za_provjeru = {
            rowPocetak : Math.min(prva_row, druga_row),
            rowKraj: Math.max(prva_row, druga_row),
            colPocetak: Math.min(prva_col, druga_col),
            colKraj: Math.max(prva_col, druga_col)
        };
    
        for(let pravokutnik of pravokutnici){
            if(!(za_provjeru.rowKraj < pravokutnik.rowPocetak || za_provjeru.rowPocetak > pravokutnik.rowKraj || 
                za_provjeru.colKraj < pravokutnik.colPocetak || za_provjeru.colPocetak > pravokutnik.colKraj))
                return false;
        }
        return true;
    }
    
    // Funkcija koja provjerava nalazi li prva odabrana ćelija unutar obojanog pravokutnika
    function provjeraPocetne(prva_row, prva_col){
        for (let pravokutnik of pravokutnici) {
            if (prva_row >= pravokutnik.rowPocetak && prva_row <= pravokutnik.rowKraj && prva_col >= pravokutnik.colPocetak && prva_col <= pravokutnik.colKraj) {
                return true;
            }
        }
        return false;
    }

    //funkcija koja dodaje odabranu boju ako je sve ok
    function dodajOdabranuBoju() {
    for (let i = 0; i < radioButtons.length; i++) {
        let radioButton = radioButtons[i];
        if (radioButton.checked) {
            odabrane_boje.push(radioButton.value);
        }
    }
    }

    //funkcija koja boja celije u pravokutniku, također sadrži i za obrube :) da se ne mora stvarat nova funkcija posebno
    function obojiPravokutnik(pravokutnik, boja) {
        for (let i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++) {
            for (let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++) {
                let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
                $celija.css('background-color', boja);
            }
        }

        //dodajemo za obrube - gornji (rjesenje nije bas idealno jer se vjerovatno moglo sve napraviti u for pelji (iznad) s if-ovima)
        let i = pravokutnik.rowPocetak;
        for(let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-top', '4px solid black');
        }
        //donji
        i = pravokutnik.rowKraj;
        for(let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-bottom', '4px solid black');
        }
        //lijevi
        let j = pravokutnik.colPocetak;
        for(i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-left', '4px solid black');
        }
        //desni
        j = pravokutnik.colKraj;
        for(i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-right', '4px solid black');
        }
    }

    //funkcija za brisanje pravokutnika nakon desnog klika misa
    function izbrisiPravokutnik(){
        let row = $(this).attr('row');
        let col = $(this).attr('col');

        for(let i = 0; i < pravokutnici.length; i++){
            if(row >= pravokutnici[i].rowPocetak && row <= pravokutnici[i].rowKraj &&
                col >= pravokutnici[i].colPocetak && col <= pravokutnici[i].colKraj){
                let odabran = pravokutnici[i];
                //vracamo nazad opciju te boje za odabir
                $('input[type="radio"][value="' + odabrane_boje[i] + '"]').prop('disabled', false);
                odabrane_boje.splice(i,1);
                brojac--;

                //nastavljamo dalje s ciscenjem celija
                pravokutnici.splice(i, 1);
                vratiNaPocetno(odabran);
                break;  
            }
        }
    }

    //boja pozadinu celije u bijelo i mice podebljan obrub
    function vratiNaPocetno(pravokutnik){
        for(let i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++){
            for(let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++){
                let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
                $celija.css('background-color', '');
            }
        }

        //micemo podebljane vanjske linije
        let i = pravokutnik.rowPocetak;
        for(let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-top', '');
        }
        //donji
        i = pravokutnik.rowKraj;
        for(let j = pravokutnik.colPocetak; j <= pravokutnik.colKraj; j++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-bottom', '');
        }
        //lijevi
        let j = pravokutnik.colPocetak;
        for(i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-left', '');
        }
        //desni
        j = pravokutnik.colKraj;
        for(i = pravokutnik.rowPocetak; i <= pravokutnik.rowKraj; i++){
            let $celija = $(`.klik-celija[row='${i}'][col='${j}']`);
            $celija.css('border-right', '');
        }
    }
   
});
