document.addEventListener('DOMContentLoaded', function() {
    const statutField = document.querySelector('#id_statut');
    const commentaireFieldRow = document.querySelector('.form-row.field-commentaire_rejet, .form-group.field-commentaire_rejet');

    if (!statutField || !commentaireFieldRow) return;

    function toggleCommentaire() {
        if (statutField.value === 'rejete') {
            commentaireFieldRow.style.display = '';
        } else {
            commentaireFieldRow.style.display = 'none';
            const textarea = commentaireFieldRow.querySelector('textarea');
            if (textarea) textarea.value = '';
        }
    }

    toggleCommentaire(); // au chargement
    statutField.addEventListener('change', toggleCommentaire); // sur changement
});
