// @todo: напишите здесь код парсера

function parsePage() {
    const result = {
        meta: {
            title: '',
            description: '',
            keywords: [],
            language: '',
            opengraph: {
                title: '',
                image: '',
                type: ''
            }
        },
        product: {
            id: '',
            name: '',
            isLiked: false,
            tags: {
                category: [],
                discount: [],
                label: []
            },
            price: 0,
            oldPrice: 0,
            discount: 0,
            discountPercent: '0%',
            currency: '',
            properties: {},
            description: '',
            images: []
        },
        suggested: [],
        reviews: []
    };

    //head - мета-информации страницы
    const titlePartes = document.querySelector('title').textContent.split("—").map(part => part.trim());
    result.meta.title = titlePartes[0];

    result.meta.description = document.querySelector('meta[name="description"]').content.trim();

    const keywordsParts = document.querySelector('meta[name="keywords"]').content.split(',').map(part => part.trim());;
    result.meta.keywords = keywordsParts;

    result.meta.language = document.querySelector('html[lang="en"]').lang.trim();

    const opengraphTitlePartes = document.querySelector('meta[property="og:title"]').content.split('-').map(part => part.trim());
    result.meta.opengraph.title = opengraphTitlePartes[0];

    const ogMetaTags = document.querySelectorAll('meta[property^="og:"]');
    ogMetaTags.forEach(tag => {
        const property = tag.getAttribute('property');
        let content;
        if(property === 'og:title'){
            const contentParts = tag.getAttribute('content').split('—').map(part => part.trim());
            content = contentParts[0];
        } else {
            content = tag.getAttribute('content').trim();
        }
        
        const key = property.replace('og:', '');
        result.meta.opengraph[key] = content;
    });

    //Данные карточки товара
    result.product.id = document.querySelector('.product').dataset.id.trim();

    result.product.name = document.querySelector('h1').textContent.trim();

    result.product.isLiked = document.querySelector('.like').classList.contains('active');

    const tagsContainer = document.querySelector('.tags');
    const tagsElems = tagsContainer.querySelectorAll('span');
    tagsElems.forEach(tag => {
        const color = tag.className;
        const text = tag.textContent.trim();
        if (color === 'green') {
            result.product.tags.category.push(text);
        } else if (color === 'blue') {
            result.product.tags.label.push(text);
        } else if (color === 'red') {
            result.product.tags.discount.push(text);
        }
    });

    const priceParts = document.querySelector('.price').textContent.split('₽').map(part => part.trim());
    result.product.price = parseInt(priceParts[1], 10);

    const oldPriceParts = document.querySelector('.price span').textContent.split('₽').map(part => part.trim());
    result.product.oldPrice = parseInt(oldPriceParts[1], 10);

    result.product.discount = result.product.oldPrice - result.product.price;

    result.product.discountPercent = ((result.product.discount / result.product.oldPrice) * 100).toFixed(2) + '%';

    const symbol = document.querySelector('.price').textContent.trim();
    if (symbol.includes('$')) {
        result.product.currency = 'USD';
    } else if (symbol.includes('€')) {
        result.product.currency = 'EUR';
    } else if (symbol.includes('₽')) {
        result.product.currency = 'RUB';
    }

    document.querySelector('.properties').querySelectorAll('li').forEach(li => {
        const key = li.querySelector('span:nth-child(1)').textContent.trim();
        const value = li.querySelector('span:nth-child(2)').textContent.trim();
        result.product.properties[key] = value;
    });

    document.querySelector('.description').querySelectorAll('*')
        .forEach(elem => {
            const attrs = Array.from(elem.attributes);
            attrs.forEach(attr => {
                elem.removeAttribute(attr.name);
            });
        });
    result.product.description = document.querySelector('.description').innerHTML.trim();

    const galleryButtons = document.querySelectorAll('.preview nav button');
    galleryButtons.forEach(galleryButton => {
        const img = galleryButton.querySelector('img');
        result.product.images.push({
            preview: img.getAttribute('src'),
            full: img.getAttribute('data-src'),
            alt: img.getAttribute('alt')
        });
    });

    //Массив дополнительных товаров
    const articleSuggested = document.querySelectorAll('.suggested article');
    articleSuggested.forEach(article => {
        const priceParts = article.querySelector('b').textContent.split('₽').map(part => part.trim());

        const symbol = article.querySelector('b').textContent.trim();
        let currency;
            if (symbol.includes('$')) {
                currency = 'USD';
            } else if (symbol.includes('€')) {
                currency = 'EUR';
            } else if (symbol.includes('₽')) {
                currency = 'RUB';
            }

        result.suggested.push({
            name: article.querySelector('h3').textContent.trim(),
            description: article.querySelector('p').textContent.trim(),
            image: article.querySelector('img').getAttribute('src'),
            price: priceParts[1],
            currency: currency
        });
    });

    //Массив обзоров
    const articlesReviews = document.querySelectorAll('.reviews article');
    articlesReviews.forEach(article => {

        //рейтинг
        const rating = article.querySelectorAll('.rating span');
        let ratResult = 0;
        rating.forEach(item => {
            if(item.className === 'filled') {
                ratResult++;
            }
        });

        //дата
        const dateParts = article.querySelector('.author i').textContent.trim().split('/');
        const formattedDate = dateParts.join('.');
        
        result.reviews.push({
            rating: ratResult,
            author: {
                avatar: article.querySelector('.author img').getAttribute('src'),
                name: article.querySelector('.author span').textContent.trim()
            },
            title: article.querySelector('.title').textContent.trim(),
            description: article.querySelector('p').textContent.trim(),
            date: formattedDate
        });
    });

    return result;
}

window.parsePage = parsePage;