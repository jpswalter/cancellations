import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button } from '@/components/ui';
import { SaveOffer } from '@/lib/db/schema';
import SimpleMDEditor from 'react-simplemde-editor';
import SimpleMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

interface EditModalProps {
  isVisible: boolean;
  offer: SaveOffer | null;
  onClose: () => void;
  onSave: (offer: Partial<SaveOffer>) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isVisible,
  offer,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const changeTitle = useCallback((value: string) => {
    setTitle(value);
  }, []);

  const changeDescription = useCallback((value: string) => {
    console.log('text', value);
    setDescription(value);
  }, []);

  useEffect(() => {
    if (offer) {
      changeTitle(offer.title);
      changeDescription(offer.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [offer, changeTitle, changeDescription]);

  const handleSave = () => {
    onSave({
      id: offer?.id,
      title,
      description,
    });
    onClose();
  };

  const autofocusNoSpellcheckerOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
      lineWrapping: true, // Enable line wrapping
      renderingConfig: {
        singleLineBreaks: false, // Preserve single line-breaks
      },
    } as SimpleMDE.Options;
  }, []);

  return (
    <Modal
      shown={isVisible}
      onClose={onClose}
      title={offer ? 'Edit Save Offer' : 'Create New Save Offer'}
      size="lg"
      footer={
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} outline={true}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSave}>
            {offer ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <SimpleMDEditor
            value={description}
            onChange={setDescription}
            options={autofocusNoSpellcheckerOptions}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditModal;
